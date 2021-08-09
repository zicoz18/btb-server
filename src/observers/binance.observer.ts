import {
  lifeCycleObserver,
  LifeCycleObserver
} from '@loopback/core';
// import Binance from 'node-binance-api';
import axios from 'axios';
import * as CryptoJs from 'crypto-js';
import * as dotenv from 'dotenv';
import * as qs from 'qs';

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
    dotenv.config();
    // Add your logic for start
    // const binance = new Binance().options({
    //   APIKEY: process.env.API_KEY,
    //   APISECRET: process.env.SECRET_KEY,
    //   useServerTime: true,
    //   recvWindow: 60000, // Set a higher recvWindow to increase response timeout
    //   verbose: true, // Add extra output when subscribing to WebSockets, etc
    // });

    // let {AVAXTRY} = await binance.prices('AVAXTRY');
    // console.log("AVAX/TRY: ", AVAXTRY);

    // const account = await binance.account();
    // console.log(account);

    // const balances = await binance.balance('ETH');
    // console.info("balances()", balances);

    // console.info("PPT balance: ", balances.PPT.available);
    // console.log(balances.PPT.available);

    // Intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
    // const {ticks, symbols} = await binance.candlesticks("AVAXUSDT", "5m");

    /* TODO: bu çalışıyor */
    // const candlesticksData = await binance.candlesticks("AVAXUSDT", "5m");
    // console.log(candlesticksData);

    // const balances = await binance.balance();
    // console.log(balances);
    // console.log(balances.PPT.available);

    // console.log('Balance for PPT: ', balance.PPT);

    // (error, ticks, symbol) => {
    //   console.info("candlesticks()", ticks);
    //   let last_tick = ticks[ticks.length - 1];
    //   let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
    //   console.info(symbol + " last close: " + close);
    // }, {limit: 500, endTime: 1514764800000});


    /* TODO: bu da çalışıyor */
    // const price = (await axios.get("https://api.binance.com/api/v3/klines?symbol=AVAXUSDT&interval=1m&limit=24")).data;
    // console.log(price);

    /* TODO: bu çalışmıyor devam etti */
    // const baseUrl = 'https://api.binance.com';
    // const endpoint = '/api/v3/account';
    // const dataQueryString = `recWindow=20000&timestamp=${Date.now()}`;
    // const keys = {
    //   apiKey: 'ScQ3o9AZqMiM7AT6O67VhaPh0RfKNI4uErj2kdKGUyrUsRLZcLzANu2MGhyCytxu',
    //   secretKey: 'HChlSk79JprQ0Yh7AVdnOiL6pYfSyHu0z9DNcfcqZYATl7ewSTxkPwxsdUqbhLHk'
    // };

    // const signature = CryptoJs.HmacSHA256(dataQueryString, keys.secretKey).toString(CryptoJs.enc.Hex);
    // const url = `${baseUrl}${endpoint}?${dataQueryString}&signature${signature}`;

    // const result = await axios.get(url, {
    //   headers: {'X-MBX-APIKEY': keys.apiKey}
    // });
    // console.log(result);


    /* TODO: bu sanırım çalışıyor */
    // const binanceConfig = {
    //   HOST_URL: 'https://api.binance.com',
    // };

    // const buildSignature = (dataQueryString: any, secretKey: any) => {
    //   // return crypto.createHmac('sha256', config.API_SECRET).update(data).digest('hex');
    //   return CryptoJs.HmacSHA256(dataQueryString, secretKey).toString(CryptoJs.enc.Hex);
    // };

    // const privateRequest = async (data: any, endPoint: any, type: any) => {
    //   const dataQueryString = qs.stringify(data);
    //   // const signature = CryptoJs.HmacSHA256(dataQueryString, keys.secretKey).toString(CryptoJs.enc.Hex);

    //   const signature = buildSignature(dataQueryString, process.env.SECRET_KEY);
    //   const requestConfig = {
    //     method: type,
    //     url: binanceConfig.HOST_URL + endPoint + '?' + dataQueryString + '&signature=' + signature,
    //     headers: {
    //       'X-MBX-APIKEY': `${process.env.API_KEY}`,
    //     },
    //   };

    //   try {
    //     console.log('URL: ', requestConfig.url);
    //     const response = await axios(requestConfig);
    //     console.log(response);
    //     return response;
    //   }
    //   catch (err) {
    //     console.log(err);
    //     return err;
    //   }
    // };

    // const data = {
    //   symbol: 'ARKBTC',
    //   recvWindow: 20000,
    //   timestamp: Date.now(),
    // };

    // const result = await privateRequest(data, '/api/v3/openOrders', 'GET');
    // console.log(result.data)




    const binanceConfig = {
      HOST_URL: 'https://api.binance.com',
    };

    const buildSignature = (dataQueryString: any, secretKey: any) => {
      // return crypto.createHmac('sha256', config.API_SECRET).update(data).digest('hex');
      return CryptoJs.HmacSHA256(dataQueryString, secretKey).toString(CryptoJs.enc.Hex);
    };

    const privateRequest = async (data: any, endPoint: any, type: any) => {
      const dataQueryString = qs.stringify(data);
      // const signature = CryptoJs.HmacSHA256(dataQueryString, keys.secretKey).toString(CryptoJs.enc.Hex);

      const signature = buildSignature(dataQueryString, process.env.SECRET_KEY);
      const requestConfig = {
        method: type,
        url: binanceConfig.HOST_URL + endPoint + '?' + dataQueryString + '&signature=' + signature,
        headers: {
          'X-MBX-APIKEY': `${process.env.API_KEY}`,
        },
      };

      try {
        console.log('URL: ', requestConfig.url);
        const response = await axios(requestConfig);
        // console.log(response);
        return response;
      }
      catch (err) {
        console.log(err);
        return err;
      }
    };

    const data = {
      // symbol: 'ARKBTC',
      recvWindow: 20000,
      timestamp: Date.now(),
    };

    const account = (await privateRequest(data, '/api/v3/account', 'GET')).data;
    console.log(account);

    console.log("AVAX balanace: ", account.balances.filter((item: {asset: string;}) => item.asset === 'AVAX')[0].free);
    console.log("USDT balanace: ", account.balances.filter((item: {asset: string;}) => item.asset === 'USDT')[0].free);
    console.log("EOS balanace: ", account.balances.filter((item: {asset: string;}) => item.asset === 'EOS')[0].free);

    console.log('Binance Observer worked!!!');
  }

}
