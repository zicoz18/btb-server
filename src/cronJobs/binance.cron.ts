import {service} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {MovingAverage, Symbols, TradeEnum} from '../enums';
import {Trade} from '../models';
import {TradeRepository} from '../repositories';
import {AccountBalanceService, BinanceRequestService, CandleSticksService, MovingAverageService, TelegramBotService} from '../services';

@cronJob()
export class BinanceCron extends CronJob {
  constructor(
    @service(BinanceRequestService)
    protected binanceRequestService: BinanceRequestService,

    @service(MovingAverageService)
    protected movingAverageService: MovingAverageService,

    @service(AccountBalanceService)
    protected accountBalanceService: AccountBalanceService,

    @service(CandleSticksService)
    protected candleSticksService: CandleSticksService,

    @service(TelegramBotService)
    protected telegramBotService: TelegramBotService,

    @repository(TradeRepository)
    protected tradeRepository: TradeRepository,
  ) {
    super({
      name: 'binance-cron',
      onTick: async () => {
        // do the work
        this.performMyJob();
      },
      // cronTime: '*/10 * * * * *', // Every ten second
      // cronTime: '0 12 * * * *', // Everyday at 12.00 (sanırım her saatin 12. dakikasinda update'liyor şuanda)
      // cronTime: '0 0 11 * * ?', // everday at 11
      // cronTime: '0 0 11 * * *', // everday at 11
      // cronTime: '5 14 * * *', // everday at 14
      cronTime: '*/10 * * * * *',
      // cronTime: '0 0 11 * * *', // everday at 11
      start: true,
    });
  }

  async performMyJob() {
    /* TODO: Get latest Trade  */
    const latestTrade = await this.tradeRepository.findOne({
      order: ['date DESC'],
      limit: 1
    });
    console.log('Latest trade: ', latestTrade);

    /* TODO: Get AVAX/USDT prices for 1 minute intervals */
    const candlesticksData = {
      symbol: Symbols.avaxUsdt,
      interval: MovingAverage.interval1m,
      limit: MovingAverage.extendedIntervalAmount
    }
    /* CandleStick's 4th value gives the closing data */
    const candlesticks = await this.binanceRequestService.sendPublicRequest(candlesticksData, '/klines', 'GET');
    /* TODO: Calculate 7 and 24 minute Moving Average */
    const extendedSMA = this.movingAverageService.calculateSMA(candlesticks, MovingAverage.extendedIntervalAmount);
    const shortenedSMA = this.movingAverageService.calculateSMA(candlesticks, MovingAverage.shortenedIntervalAmount);
    const latestClosingPrice = this.candleSticksService.getLatestClosingPrice(candlesticks);
    console.log('24 min SMA: ', extendedSMA);
    console.log('7 min SMA: ', shortenedSMA);
    console.log('Latest closing price: ', latestClosingPrice);

    let tradeSide = null;
    /* If shortSMA is bigger than longSMA and previous trade was selling. It is a buy signal  */
    if ((shortenedSMA > extendedSMA) && latestTrade?.side === TradeEnum.sell) {
      tradeSide = TradeEnum.buy;
      /* If longSMA is bigger than shortSMA and previous trade was buying. It is a selling signal  */
    } else if ((shortenedSMA < extendedSMA) && latestTrade?.side === TradeEnum.buy) {
      tradeSide = TradeEnum.sell;
    } else {
      console.log('Not executing a trade, there is no signal to buy or sell.');
      return;
    }
    /* TODO: Get how much AVAX and USDT you have */
    const accountData = {
    };
    const account = await this.binanceRequestService.sendPrivateRequest(accountData, '/account', 'GET');
    const avaxBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.avax);
    const usdtBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.usdt);
    console.log('AVAX Balance: ', avaxBalance);
    console.log('USDT Balance:', usdtBalance);
    let avaxQuantity = 0;
    if (tradeSide === TradeEnum.buy) {
      avaxQuantity = parseFloat(((parseFloat((usdtBalance * TradeEnum.balanceQuantityConstant).toFixed(3)) / latestClosingPrice).toFixed(3)));
    } else {
      avaxQuantity = parseFloat((avaxBalance * TradeEnum.balanceQuantityConstant).toFixed(3));
    }
    console.log('Signal: ', tradeSide);
    // console.log((longAverageTickAmount - shortAverageTickAmount), candlesticks.length-1S);
    /* TODO: Create an order */
    if (avaxQuantity * latestClosingPrice < TradeEnum.minTradeSize) {
      console.log('Trade size is less than 10 usdt. Therefore cannot perform the trade.');
      return;
    }
    console.log('Trade is valid.');

    const tradeData = {
      symbol: Symbols.avaxUsdt,
      side: tradeSide,
      type: TradeEnum.type,
      quantity: avaxQuantity,
    };
    console.log(tradeData);
    let trade: any = {};
    try {
      trade = await this.binanceRequestService.sendPrivateRequest(tradeData, '/order', 'POST');
    } catch (err) {
      console.log('Error occured while performing a trade.');
      console.log(err);
      return;
    }
    /*
    Successful trade response =>
      {
        symbol: 'AVAXUSDT',
        orderId: 454128956,
        orderListId: -1,
        clientOrderId: 'qu6NzN0vrk0N6OhxzbsF8G',
        transactTime: 1628936021877,
        price: '0.00000000',
        origQty: '1.00000000',
        executedQty: '1.00000000',
        cummulativeQuoteQty: '17.55600000',
        status: 'FILLED',
        timeInForce: 'GTC',
        type: 'MARKET',
        side: 'SELL',
        fills: [
          {
            price: '17.55600000',
            qty: '1.00000000',
            commission: '0.01755600',
            commissionAsset: 'USDT',
            tradeId: 31283757
          }
        ]
      }
  */
    /* TODO: After creating order, write the order to DB */
    const successfulTrade = new Trade({
      symbol: trade.symbol,
      price: trade.fills[0].price,
      quantity: trade.fills[0].qty,
      side: trade.side,
    });
    const createdTrade = await this.tradeRepository.create(successfulTrade);


    /* TODO: After trade happens calculate account's balance in USDT */
    const accountAfterTrade = await this.binanceRequestService.sendPrivateRequest(accountData, '/account', 'GET');
    const avaxBalanceAfterTrade = this.accountBalanceService.getSymbolBalance(account, Symbols.avax);
    const usdtBalanceAfterTrade = this.accountBalanceService.getSymbolBalance(account, Symbols.usdt);
    const avaxBalanceAfterBalanceInUsdt = avaxBalanceAfterTrade * parseFloat(successfulTrade.price);
    const totalBalance = avaxBalanceAfterBalanceInUsdt + usdtBalanceAfterTrade;
    console.log(totalBalance);

    /* TODO: createdTrade data'sını telegram üzerinden mesaj olarak yolla */
    const message = `Trade executed.\n${createdTrade.side}, ${createdTrade.quantity} AVAX at ${createdTrade.price}.\nTotal trade size: ${parseFloat(createdTrade.quantity) * parseFloat(createdTrade.price)}\nAccount balance after trade: ${totalBalance}$`;
    await this.telegramBotService.sendMessage(message);
    console.log('Cron job runs every 10 seconds.');
  }
}
