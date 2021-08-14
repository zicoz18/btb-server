import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {closingPriceIndex, significantDigitAmount} from '../variables';

@injectable({scope: BindingScope.TRANSIENT})
export class CandleSticksService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */
  getClosingPrices(candlesticks: any) {
    return candlesticks.map((tick: string[]) => parseFloat(tick[closingPriceIndex]));
  }

  sumClosingPrices(closingPrices: any[]) {
    return closingPrices.reduce((a: any, b: any) => (
      a + b
    )).toFixed(significantDigitAmount);
  }

  /* CandleSticks and ClosingPrices have most recent data at the end of the array */
  getPeriodAmountClosingPrices(closingPrices: any, periodAmount: number) {
    return closingPrices.filter((item: number, idx: number) => (
      idx >= closingPrices.length - periodAmount
    ));
  }

  getLatestClosingPrice(candlesticks: any) {
    return parseFloat(candlesticks[candlesticks.length - 1][closingPriceIndex]);
  }

}
