import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Balance, Trade, TradeRelations} from '../models';
import {BalanceRepository} from './balance.repository';

export class TradeRepository extends DefaultCrudRepository<
  Trade,
  typeof Trade.prototype.id,
  TradeRelations
> {

  public readonly balance: HasOneRepositoryFactory<Balance, typeof Trade.prototype.id>;

  constructor(
    @inject('datasources.mongo')
    dataSource: MongoDataSource,

    @repository.getter('BalanceRepository')
    protected balanceRepositoryGetter: Getter<BalanceRepository>,
  ) {
    super(Trade, dataSource);
    this.balance = this.createHasOneRepositoryFactoryFor('balance', balanceRepositoryGetter);
    this.registerInclusionResolver('balance', this.balance.inclusionResolver);
  }
}
