import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Trade, TradeRelations} from '../models';

export class TradeRepository extends DefaultCrudRepository<
  Trade,
  typeof Trade.prototype.id,
  TradeRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Trade, dataSource);
  }
}
