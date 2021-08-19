import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Trade} from './trade.model';

@model()
export class Balance extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    defaultFn: 'uuidv4',
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'number',
    required: true,
  })
  amountInUsdt: number;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  date?: Date;

  @belongsTo(() => Trade)
  tradeId: string;

  constructor(data?: Partial<Balance>) {
    super(data);
  }
}

export interface BalanceRelations {
  // describe navigational properties here
}

export type BalanceWithRelations = Balance & BalanceRelations;
