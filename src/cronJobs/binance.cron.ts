import { CronJob, cronJob } from '@loopback/cron';

@cronJob()
export class BinanceCron extends CronJob {
  constructor(
  ) {
    super({
      name: 'binance-cron',
      onTick: async () => {
        // do the work
        this.performMyJob();
      },
      // cronTime: '*/10 * * * * *', // Every ten second
      // cronTime: '0 12 * * * *', // Everyday at 12.00 (sanırım her saatin 12. dakikasinda update'liyor şuanda)
      // cronTime: '0 0 11 * * ?', // everday at 11
      // cronTime: '0 0 11 * * *', // everday at 11
      // cronTime: '5 14 * * *', // everday at 14
      cronTime: '*/10 * * * * *',
      start: true,
    });
  }

  async performMyJob() {
    console.log('Cron job runs every 10 seconds.');
  }
}
