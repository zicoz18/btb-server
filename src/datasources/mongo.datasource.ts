import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';


dotenv.config();
const config = {
  name: 'mongo',
  connector: 'mongodb',
  url: `mongodb+srv://zicoz18:${process.env.DB_PASSWORD}@cluster0.i44r7.mongodb.net/BTB?retryWrites=true&w=majority`,
  host: 'localhost',
  port: 27017,
  user: 'zicoz18',
  password: `${process.env.DB_PASSWORD}`,
  database: 'BinanceTradingBot',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongo';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
