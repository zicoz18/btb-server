import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Balance, BalanceRelations} from '../models';

export class BalanceRepository extends DefaultCrudRepository<
  Balance,
  typeof Balance.prototype.id,
  BalanceRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Balance, dataSource);
  }
}
