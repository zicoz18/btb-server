import { /* inject, */ BindingScope, injectable, service} from '@loopback/core';
import axios, {AxiosRequestConfig} from 'axios';
import qs from 'qs';
import {BinanceEnum} from '../enums';
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
      url: `${BinanceEnum.completeUrl}${endpoint}?${dataQueryString}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': `${process.env.API_KEY}`,
      },
    };
    try {
      return (await axios(requestConfig)).data;
    } catch (err) {
      console.log(err.response.data.msg)
    }
  }

  async sendPublicRequest(data: any, endpoint: string, type: any) {
    const dataQueryString = qs.stringify(data);
    const requestConfig = <AxiosRequestConfig>{
      method: type,
      url: `${BinanceEnum.completeUrl}${endpoint}?${dataQueryString}`
    }
    try {
      return (await axios(requestConfig)).data;
    } catch (err) {
      console.log(err.request.data);
    }
  }
}
