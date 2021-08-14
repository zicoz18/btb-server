import { /* inject, */ BindingScope, injectable, service} from '@loopback/core';
import {significantDigitAmount} from '../variables';
import {CandleSticksService} from './candle-sticks.service';

@injectable({scope: BindingScope.TRANSIENT})
export class MovingAverageService {
  constructor(
    @service(CandleSticksService)
    protected candleSticksService: CandleSticksService,
  ) { }

  /*
   * Add service methods here
   */
  calculateSMA(candlesticks: any, periodAmount: number) {
    const closingPrices = this.candleSticksService.getClosingPrices(candlesticks);
    const periodAmountClosingPrices = this.candleSticksService.getPeriodAmountClosingPrices(closingPrices, periodAmount);
    const sumPrice = this.candleSticksService.sumClosingPrices(periodAmountClosingPrices);
    return (sumPrice / periodAmount).toFixed(significantDigitAmount);
  }

}
