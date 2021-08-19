import {service} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {BalanceType, MovingAverage, Symbols, TradeEnum} from '../enums';
import {CronExpression} from '../enums/cronExpressions/cron-expressions.enum';
import {Balance, Trade} from '../models';
import {BalanceRepository, TradeRepository} from '../repositories';
import {AccountBalanceService, BinanceRequestService, CandleSticksService, MovingAverageService, TelegramBotService} from '../services';
import {significantDigitAmount} from '../variables';

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

    @repository(BalanceRepository)
    protected balanceRepository: BalanceRepository,
  ) {
    super({
      name: 'binance-cron',
      onTick: async () => {
        this.performMyJob();
      },
      cronTime: CronExpression.every5minutes, // Every 5 minutes
      start: true,
    });
  }

  async performMyJob() {
    const currentDate = new Date();
    /* Get latest Trade  */
    const latestTrade = await this.tradeRepository.findOne({
      order: ['date DESC'],
      limit: 1
    });

    /* Get AVAX/USDT prices with 1 minute intervals */
    const candlesticksData = {
      symbol: Symbols.avaxUsdt,
      interval: MovingAverage.interval5m,
      limit: MovingAverage.extendedIntervalAmount
    }

    let candlesticks: any;
    try {
      candlesticks = await this.binanceRequestService.sendPublicRequest(candlesticksData, '/klines', 'GET');
    } catch (err) {
      console.log('Error occured while getting candle data.');
      return;
    }
    /* Calculate short and long Simple Moving Average */
    const extendedSMA = this.movingAverageService.calculateSMA(candlesticks, MovingAverage.extendedIntervalAmount);
    const shortenedSMA = this.movingAverageService.calculateSMA(candlesticks, MovingAverage.shortenedIntervalAmount);
    const latestClosingPrice = this.candleSticksService.getLatestClosingPrice(candlesticks);

    /* Trade side indicates whether we will buy or sell AVAX */
    let tradeSide = null;
    /* If shortSMA is bigger than longSMA and previous trade was selling. It is a buy signal  */
    if ((shortenedSMA > extendedSMA) && latestTrade?.side === TradeEnum.sell) {
      tradeSide = TradeEnum.buy;
      /* If longSMA is bigger than shortSMA and previous trade was buying. It is a selling signal  */
    } else if ((shortenedSMA < extendedSMA) && latestTrade?.side === TradeEnum.buy) {
      tradeSide = TradeEnum.sell;
    } else {
      /* Since there is no signal to buy or sell we do not perform any action. */
      console.log('Not executing a trade, there is no signal to buy or sell.');
      return;
    }

    /* Get how much AVAX and USDT account has */
    let account: any;
    try {
      account = await this.binanceRequestService.sendPrivateRequest({}, '/account', 'GET');
    } catch (err) {
      console.log('Error occured while getting account data.');
      return;
    }
    const avaxBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.avax);
    const usdtBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.usdt);
    let avaxQuantity = 0;
    if (tradeSide === TradeEnum.buy) {
      /* Get avax quantity by multiplying usdtBalance with balanceQuantityConstant and dividing it by lastClosingPrice of avax */
      avaxQuantity = parseFloat(((parseFloat((usdtBalance * TradeEnum.balanceQuantityConstant).toFixed(significantDigitAmount)) / latestClosingPrice).toFixed(significantDigitAmount)));
    } else {
      /* Get avax quantity by multilpying avaxBalance with balanceQuantityConstant */
      avaxQuantity = parseFloat((avaxBalance * TradeEnum.balanceQuantityConstant).toFixed(significantDigitAmount));
    }
    /* Check if trade volume is higher than minTradeSize (which is 10 usdt right now.) */
    if (avaxQuantity * latestClosingPrice < TradeEnum.minTradeSize) {
      console.log(`Cannot ${tradeSide}. Trade size is less than ${TradeEnum.minTradeSize} usdt. Therefore cannot perform the trade.`);
      return;
    }

    /* Create tradeData with logic implemented above */
    const tradeData = {
      symbol: Symbols.avaxUsdt,
      side: tradeSide,
      type: TradeEnum.type,
      quantity: avaxQuantity,
    };
    let trade: any;
    try {
      trade = await this.binanceRequestService.sendPrivateRequest(tradeData, '/order', 'POST');
    } catch (err) {
      console.log('Error occured while creating a trade order.');
      return;
    }

    /* After creating order, write the order to DB */
    const successfulTrade = new Trade({
      symbol: trade.symbol,
      price: parseFloat(parseFloat(trade.fills[0].price).toFixed(significantDigitAmount)),
      quantity: parseFloat(parseFloat(trade.fills[0].qty).toFixed(significantDigitAmount)),
      side: trade.side,
      date: currentDate,
    });

    const createdTrade = await this.tradeRepository.create(successfulTrade);
    /* After trade happens calculate account's balance in USDT */
    const totalBalance = await this.balanceRepository.calculateBalanceInUsdt(successfulTrade.price);

    /* Write the balance to DB */
    const balanceAfterTrade = new Balance({
      amountInUsdt: totalBalance,
      tradeId: createdTrade.id,
      date: currentDate,
      type: BalanceType.Trade,
    });
    const createdBalance = await this.tradeRepository.balance(createdTrade.id).create(balanceAfterTrade);

    /* Send message via Telegram,   */
    const message = `Trade executed.
    \n${createdTrade.side}, ${createdTrade.quantity} AVAX at ${createdTrade.price}.
    \nTotal trade size: ${parseFloat((createdTrade.quantity * createdTrade.price).toFixed(significantDigitAmount))}
    \nAccount balance after trade: ${createdBalance.amountInUsdt}$`;

    try {
      await this.telegramBotService.sendMessage(message);
    } catch (err) {
      console.log('Error occured while sending Telegram message.');
      return;
    }
    console.log('Cron job runs every 10 minutes.');
  }
}
