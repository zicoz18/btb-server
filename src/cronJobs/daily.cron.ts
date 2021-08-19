import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {BalanceType} from '../enums';
import {CronExpression} from '../enums/cronExpressions/cron-expressions.enum';
import {BalanceRepository} from '../repositories';

@cronJob()
export class DailyBalanceCron extends CronJob {
  constructor(
    @repository(BalanceRepository)
    protected balanceRepository: BalanceRepository,
  ) {
    super({
      name: 'daily-cron',
      onTick: async () => {
        this.performMyJob();
      },
      cronTime: CronExpression.everydayAt1105, // everday at 11.05
      start: true,
    });
  }

  async performMyJob() {
    await this.balanceRepository.updateCronicBalance(BalanceType.Daily);
  }
}
