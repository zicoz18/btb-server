import {
  lifeCycleObserver,
  LifeCycleObserver
} from '@loopback/core';
import Binance from 'node-binance-api';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class BinanceObserver implements LifeCycleObserver {
  /*
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}
  */

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Add your logic for start
    const binance = new Binance().options({
      APIKEY: '<key>',
      APISECRET: '<secret>'
    });

    console.log('Binance Observer worked!!!');
  }

}
