import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {BalanceType} from '../enums';
import {CronExpression} from '../enums/cronExpressions/cron-expressions.enum';
import {BalanceRepository} from '../repositories';

@cronJob()
export class MonthlyCron extends CronJob {
  constructor(
    @repository(BalanceRepository)
    protected balanceRepository: BalanceRepository,
  ) {
    super({
      name: 'monthly-cron',
      onTick: async () => {
        this.performMyJob();
      },
      cronTime: CronExpression.everyFirstDayOfMonthAt1105,// At 11:05 AM, on day 1 of the month
      start: true,
    });
  }

  async performMyJob() {
    await this.balanceRepository.updateCronicBalance(BalanceType.Monthly);
  }
}
