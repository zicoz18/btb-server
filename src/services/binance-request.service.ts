import { /* inject, */ BindingScope, injectable, service} from '@loopback/core';
import axios, {AxiosRequestConfig} from 'axios';
import qs from 'qs';
import {BinanceAPI} from '../enums';
import {SignatureService} from './signature.service';

@injectable({scope: BindingScope.TRANSIENT})
export class BinanceRequestService {
  constructor(
    @service(SignatureService)
    protected signatureService: SignatureService,
  ) { }

  /*
   * Add service methods here
   */

  /*
    Successful trade response =>
      {
        symbol: 'AVAXUSDT',
        orderId: 454128956,
        orderListId: -1,
        clientOrderId: 'askjdjahsvdfahsduas',
        transactTime: 1628936021877,
        price: '0.00000000',
        origQty: '1.00000000',
        executedQty: '1.00000000',
        cummulativeQuoteQty: '17.55600000',
        status: 'FILLED',
        timeInForce: 'GTC',
        type: 'MARKET',
        side: 'SELL',
        fills: [
          {
            price: '17.55600000',
            qty: '1.00000000',
            commission: '0.01755600',
            commissionAsset: 'USDT',
            tradeId: 31283757
          }
        ]
      }
*/


  /* https://windowsloop.com/windows-time-sync-command/ */
  /* Sync computer time with server */

  /**
   *  Make a private request to the binance api
   *
   * @param {*} data
   * @param {*} endpoint
   * @param {*} type
   * @return {*}  {Promise<any>}
   * @memberof BinanceRequestService
   */
  async sendPrivateRequest(data: any, endpoint: string, type: any): Promise<any> {
    const privateRequestFixData = {
      recvWindow: 20000,
      timestamp: Date.now(),
    }
    data = {...privateRequestFixData, ...data};
    const dataQueryString = qs.stringify(data);
    const signature = this.signatureService.createSignature(dataQueryString);
    const requestConfig = <AxiosRequestConfig>{
      method: type,
      url: `${BinanceAPI.completeUrl}${endpoint}?${dataQueryString}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': `${process.env.API_KEY}`,
      },
    };
    try {
      return (await axios(requestConfig)).data;
    } catch (err: any) {
      console.log(err.response.data.msg)
    }
  }

  async sendPublicRequest(data: any, endpoint: string, type: any) {
    const dataQueryString = qs.stringify(data);
    const requestConfig = <AxiosRequestConfig>{
      method: type,
      url: `${BinanceAPI.completeUrl}${endpoint}?${dataQueryString}`
    }
    try {
      return (await axios(requestConfig)).data;
    } catch (err: any) {
      console.log(err.request.data);
    }
  }
}
