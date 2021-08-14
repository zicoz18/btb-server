import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import axios from 'axios';

@injectable({scope: BindingScope.TRANSIENT})
export class TelegramBotService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */
  async sendMessage(message: string) {
    await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${message}`);
  }
}
