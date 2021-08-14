import {
  lifeCycleObserver,
  LifeCycleObserver
} from '@loopback/core';
import * as dotenv from 'dotenv';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class BinanceObserver implements LifeCycleObserver {

  constructor(
    // @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,

  ) { }


  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    dotenv.config();
    console.log('Binance Observer worked!!!');
  }
}
