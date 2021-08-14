import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import CryptoJs from 'crypto-js';

@injectable({scope: BindingScope.TRANSIENT})
export class SignatureService {
  constructor(/* Add @inject to inject parameters */) { }

  createSignature(dataQueryString: string) {
    return CryptoJs.HmacSHA256(dataQueryString, <string>process.env.SECRET_KEY).toString(CryptoJs.enc.Hex);
  }
}
