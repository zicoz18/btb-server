import {Entity, model, property} from '@loopback/repository';

@model()
export class Trade extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  symbol: string;

  @property({
    type: 'string',
    required: true,
  })
  price: string;

  @property({
    type: 'string',
    required: true,
  })
  quantity: string;

  @property({
    type: 'string',
    required: true,
  })
  side: string;


  constructor(data?: Partial<Trade>) {
    super(data);
  }
}

export interface TradeRelations {
  // describe navigational properties here
}

export type TradeWithRelations = Trade & TradeRelations;
