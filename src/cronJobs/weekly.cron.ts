import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {BalanceType} from '../enums';
import {CronExpression} from '../enums/cronExpressions/cron-expressions.enum';
import {BalanceRepository} from '../repositories';

@cronJob()
export class WeeklyBalanceCron extends CronJob {
  constructor(
    @repository(BalanceRepository)
    protected balanceRepository: BalanceRepository,
  ) {
    super({
      name: 'weekly-cron',
      onTick: async () => {
        this.performMyJob();
      },
      cronTime: CronExpression.everyMondayAt1105, // At 11:05 AM, only on Monday
      start: true,
    });
  }

  async performMyJob() {
    await this.balanceRepository.updateCronicBalance(BalanceType.Weekly);
  }
}
