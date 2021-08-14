import {service} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {MovingAverage, Symbols} from '../enums';
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

    // console.log((longAverageTickAmount - shortAverageTickAmount), candlesticks.length-1S);
    /* TODO: Create an order */

    // const tradeSide = 'SELL';

    // const tradeData = {
    //   symbol: Trade.avaxUsdtSymbol,
    //   side: Trade.sell,
    //   type: Trade.type,
    //   quantity: 0.1,
    //   // timeInForce: 'GTC',
    // };
    // const trade = await this.binanceRequestService.sendPrivateRequest(tradeData, '/order', 'POST');
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
