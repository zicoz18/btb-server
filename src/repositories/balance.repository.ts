import {Getter, inject, service} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Symbols} from '../enums';
import {Balance, BalanceRelations, Trade} from '../models';
import {AccountBalanceService, BinanceRequestService} from '../services';
import {significantDigitAmount} from '../variables';
import {TradeRepository} from './trade.repository';

export class BalanceRepository extends DefaultCrudRepository<
  Balance,
  typeof Balance.prototype.id,
  BalanceRelations
> {

  public readonly trade: BelongsToAccessor<Trade, typeof Balance.prototype.id>;

  constructor(
    @inject('datasources.mongo')
    dataSource: MongoDataSource,

    @repository.getter('TradeRepository')
    protected tradeRepositoryGetter: Getter<TradeRepository>,

    @service(AccountBalanceService)
    protected accountBalanceService: AccountBalanceService,

    @service(BinanceRequestService)
    protected binanceRequestService: BinanceRequestService,
  ) {
    super(Balance, dataSource);
    this.trade = this.createBelongsToAccessorFor('trade', tradeRepositoryGetter,);
    this.registerInclusionResolver('trade', this.trade.inclusionResolver);
  }

  async calculateBalanceInUsdt(avaxPrice?: number): Promise<number> {
    const account = await this.binanceRequestService.sendPrivateRequest({}, '/account', 'GET');
    const avaxBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.avax);
    const usdtBalance = this.accountBalanceService.getSymbolBalance(account, Symbols.usdt);
    if (!avaxPrice) {
      avaxPrice = parseFloat((await this.binanceRequestService.sendPublicRequest({symbol: Symbols.avaxUsdt}, '/ticker/price', 'GET')).price);
    }
    const avaxBalanceInUsdt = avaxBalance * parseFloat((avaxPrice).toFixed(significantDigitAmount));
    const totalBalanceInUsdt = parseFloat((avaxBalanceInUsdt + usdtBalance).toFixed(significantDigitAmount));
    return totalBalanceInUsdt;
  }

  // async createCronicBalance(type: string) {
  //   const currentDate = new Date();
  //   const currentBalance = await this.calculateBalanceInUsdt();
  //   const newBalance = new Balance({
  //     amountInUsdt: currentBalance,
  //     date: currentDate,
  //     type: type
  //   });
  //   await this.create(newBalance);
  // }

  async updateCronicBalance(type: string) {
    const currentDate = new Date();
    const currentBalance = await this.calculateBalanceInUsdt();
    const existingCronicBalance = await this.findOne({
      where: {
        type: type,
      }
    });
    const newBalance = new Balance({
      amountInUsdt: currentBalance,
      date: currentDate,
      type: type
    });
    if (existingCronicBalance) {
      await this.update(existingCronicBalance, newBalance);
    } else {
      await this.create(newBalance);
    }
  }
}
