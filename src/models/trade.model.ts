import {Entity, model, property, hasOne} from '@loopback/repository';
import {Balance} from './balance.model';

@model()
export class Trade extends Entity {
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
  symbol: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  @property({
    type: 'number',
    required: true,
  })
  quantity: number;

  @property({
    type: 'string',
    required: true,
  })
  side: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  date?: Date;

  @hasOne(() => Balance)
  balance: Balance;

  constructor(data?: Partial<Trade>) {
    super(data);
  }
}

export interface TradeRelations {
  // describe navigational properties here
}

export type TradeWithRelations = Trade & TradeRelations;
