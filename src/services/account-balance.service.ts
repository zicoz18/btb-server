import { /* inject, */ BindingScope, injectable} from '@loopback/core';

@injectable({scope: BindingScope.TRANSIENT})
export class AccountBalanceService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */
  getSymbolBalance(account: any, symbol: string): number {
    return parseFloat(account.balances.filter((item: {asset: string;}) => item.asset === symbol)[0].free);
  }
}
