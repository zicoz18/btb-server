import {service} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {MovingAverage, Symbols, Trade} from '../enums';
import {AccountBalanceService, BinanceRequestService, MovingAverageService} from '../services';

@cronJob()
export class BinanceCron extends CronJob {
  constructor(
    @service(BinanceRequestService)
    protected binanceRequestService: BinanceRequestService,

    @service(MovingAverageService)
    protected movingAverageService: MovingAverageService,

    @service(AccountBalanceService)
    protected accountBalanceService: AccountBalanceService,
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
      start: true,
    });
  }

  async performMyJob() {
    /* TODO: Get how much AVAX and USDT you have */
    const accountData = {
    };
    const account = await this.binanceRequestService.sendPrivateRequest(accountData, '/account', 'GET');
    const avaxBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.avax);
    const usdtBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.usdt);

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
    console.log('24 min SMA: ', extendedSMA);
    console.log('7 min SMA: ', shortenedSMA);

    let tradeSide = null;
    let avaxOrUsdtQuantity = 0;
    if (shortenedSMA > extendedSMA) {
      /* TODO: buy avax */
      tradeSide = Trade.buy;
      avaxOrUsdtQuantity = avaxBalance * Trade.balanceQuantityConstant;
    } else if (shortenedSMA < extendedSMA) {
      /* TODO: sell avax */
      tradeSide = Trade.sell;
      avaxOrUsdtQuantity = usdtBalance * Trade.balanceQuantityConstant;
    } else {
      console.log('TradeSide or quantity is not valid.');
      return;
    }
    // if (!(tradeSide || avaxOrUsdtQuantity)) {
    // }

    console.log('Should not print if trade is not valid.');

    // console.log((longAverageTickAmount - shortAverageTickAmount), candlesticks.length-1S);
    /* TODO: Create an order */

    // const tradeSide = 'SELL';

    const tradeData = {
      symbol: Symbols.avaxUsdt,
      side: Trade.sell,
      type: Trade.type,
      quantity: avaxOrUsdtQuantity,
      // timeInForce: 'GTC',
    };
    console.log(tradeData);
    // const trade = await this.binanceRequestService.sendPrivateRequest(tradeData, '/order', 'POST');

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


    // console.log('\n\n', trade);
    // // console.log(trade.executedQty);
    // const price = trade.fills[0].price;
    // console.log(price);
    // const quantity = trade.fills[0].price;
    // console.log(quantity);
    // console.log(`${tradeSide}, ${quantity} AVAX at ${price}.\nTotal trade size: ${quantity * price}`);

    console.log('Cron job runs every 10 seconds.');

  }
}
