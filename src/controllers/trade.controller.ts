import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Trade} from '../models';
import {TradeRepository} from '../repositories';

export class TradeController {
  constructor(
    @repository(TradeRepository)
    public tradeRepository : TradeRepository,
  ) {}

  @post('/trades')
  @response(200, {
    description: 'Trade model instance',
    content: {'application/json': {schema: getModelSchemaRef(Trade)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Trade, {
            title: 'NewTrade',
            exclude: ['id'],
          }),
        },
      },
    })
    trade: Omit<Trade, 'id'>,
  ): Promise<Trade> {
    return this.tradeRepository.create(trade);
  }

  @get('/trades/count')
  @response(200, {
    description: 'Trade model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Trade) where?: Where<Trade>,
  ): Promise<Count> {
    return this.tradeRepository.count(where);
  }

  @get('/trades')
  @response(200, {
    description: 'Array of Trade model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Trade, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Trade) filter?: Filter<Trade>,
  ): Promise<Trade[]> {
    return this.tradeRepository.find(filter);
  }

  @patch('/trades')
  @response(200, {
    description: 'Trade PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Trade, {partial: true}),
        },
      },
    })
    trade: Trade,
    @param.where(Trade) where?: Where<Trade>,
  ): Promise<Count> {
    return this.tradeRepository.updateAll(trade, where);
  }

  @get('/trades/{id}')
  @response(200, {
    description: 'Trade model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Trade, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Trade, {exclude: 'where'}) filter?: FilterExcludingWhere<Trade>
  ): Promise<Trade> {
    return this.tradeRepository.findById(id, filter);
  }

  @patch('/trades/{id}')
  @response(204, {
    description: 'Trade PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Trade, {partial: true}),
        },
      },
    })
    trade: Trade,
  ): Promise<void> {
    await this.tradeRepository.updateById(id, trade);
  }

  @put('/trades/{id}')
  @response(204, {
    description: 'Trade PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() trade: Trade,
  ): Promise<void> {
    await this.tradeRepository.replaceById(id, trade);
  }

  @del('/trades/{id}')
  @response(204, {
    description: 'Trade DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.tradeRepository.deleteById(id);
  }
}
