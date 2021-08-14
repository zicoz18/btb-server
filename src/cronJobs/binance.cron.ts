import {service} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {MovingAverage, Trade} from '../enums';
import {BinanceRequestService, SignatureService} from '../services';
import {closingPriceIndex} from '../variables';

@cronJob()
export class BinanceCron extends CronJob {
  constructor(
    @service(BinanceRequestService)
    protected binanceRequestService: BinanceRequestService,

    @service(SignatureService)
    protected signatureService: SignatureService,
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
    const avaxBalance = account.balances.filter((item: {asset: string;}) => item.asset === 'AVAX')[0].free;
    const usdtBalance = account.balances.filter((item: {asset: string;}) => item.asset === 'USDT')[0].free;

    /* TODO: Get AVAX/USDT prices for 1 minute intervals */
    const candlesticksData = {
      symbol: Trade.avaxUsdtSymbol,
      interval: MovingAverage.interval1m,
      limit: MovingAverage.extendedIntervalAmount
    }
    /* CandleStick's 4th value gives the closing data */
    const candlesticks = await this.binanceRequestService.sendPublicRequest(candlesticksData, '/klines', 'GET');
    /* TODO: Calculate 7 and 24 minute Moving Average */

    /* Get closing price for each tick */
    const closingPrices = candlesticks.map((tick: string[]) => parseFloat(tick[closingPriceIndex]));
    // console.log(closingPrices);
    /* Get sum of  */
    const sumPrice = closingPrices.reduce((a: any, b: any) => (
      a + b
    )).toFixed(3);
    console.log('24 tick sum: ', sumPrice);
    /* Get the average */
    const average24tick = (sumPrice / MovingAverage.extendedIntervalAmount).toFixed(3);
    console.log('24 tick average: ', average24tick);

    /* Get average for last 7 ticks */
    const shortCandleSticks = candlesticks.slice((MovingAverage.extendedIntervalAmount - MovingAverage.shortenedIntervalAmount), candlesticks.length);
    const shortClosingPrices = shortCandleSticks.map((tick: string[]) => parseFloat(tick[closingPriceIndex]));
    const shortSumPrice = shortClosingPrices.reduce((a: any, b: any) => (
      a + b
    )).toFixed(3);
    console.log('7 tick sum: ', shortSumPrice);
    const average7tick = (shortSumPrice / MovingAverage.shortenedIntervalAmount).toFixed(3);
    console.log('7 tick average: ', average7tick);

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
