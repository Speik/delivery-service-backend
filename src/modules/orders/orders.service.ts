import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, In, Not, Repository } from 'typeorm';

import {
  OrderData,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from 'src/declarations';

import { TransactionFactory } from 'src/shared';

import { CustomersService } from '../customers/customers.service';
import { DishesService } from '../dishes/dishes.service';
import { OrdersSocketGateway } from '../web-sockets/orders.gateway';

import { Order } from 'src/entities/order.entity';
import { Customer } from 'src/entities/customer.entity';
import { Dish } from 'src/entities/dish.entity';
import { OrdersDishes } from 'src/entities/orders-dishes.entity';

type CreateOrderPayload = {
  customer: Omit<
    Customer,
    'id' | 'createdAt' | 'updatedAt' | 'customerNumber' | 'orders'
  >;
  dishes: Dish[];
  paymentMethod: PaymentMethod;
  type: OrderType;
  address: string | null;
  comment: string | null;
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private dataSource: DataSource,
    private customersService: CustomersService,
    private dishesService: DishesService,
    private ordersSocketGateway: OrdersSocketGateway,
  ) {}

  /**
   * We need to search for orders by `orderNumber` as
   * a string, so to simplify fetching and reduce
   * complexity Query Builder is used here
   */
  public async search(term: string) {
    const orders = await this.ordersRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'c')
      .leftJoinAndSelect('o.ordersDishes', 'od')
      .leftJoinAndSelect('od.dish', 'odd')
      .where('o."orderNumber"::TEXT ILIKE :term', {
        term: `${parseInt(term)}%`,
      })
      .orderBy('o."createdAt"', 'DESC')
      .getMany();

    return orders.map(this.formatResponse.bind(this));
  }

  public async get(limit: number, offset: number, isOnlyActive: boolean) {
    const findOptions: FindManyOptions<Order> = {
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['customer', 'ordersDishes'],
    };

    if (isOnlyActive) {
      const completedStatuses = [OrderStatus.CANCELLED, OrderStatus.COMPLETED];

      findOptions.where = {
        status: Not(In(completedStatuses)),
      };
    }

    const orders = await this.ordersRepository.find(findOptions);
    return orders.map(this.formatResponse.bind(this));
  }

  public async getById(id: string): Promise<OrderData | null>;
  public async getById(id: string[]): Promise<OrderData[]>;
  public async getById(id: string | string[]) {
    const isSingleId = typeof id === 'string';

    if (isSingleId) {
      const order = await this.ordersRepository.findOne({
        where: { id },
        relations: ['customer', 'ordersDishes'],
      });

      return order ? this.formatResponse(order) : null;
    }

    const orders = await this.ordersRepository.find({
      where: { id: In(id) },
      relations: ['customer', 'ordersDishes'],
    });

    return orders.map(this.formatResponse.bind(this));
  }

  public async create(payload: CreateOrderPayload) {
    const transaction = await TransactionFactory.create(this.dataSource);
    const orderPrice = this.calculatePrice(payload.dishes);

    try {
      const customer = await this.customersService.create(
        payload.customer,
        transaction,
      );

      const order = await transaction.manager.save(Order, {
        status: OrderStatus.CREATED,
        type: payload.type,
        paymentMethod: payload.paymentMethod,
        comment: payload.comment,
        address: payload.address,
        price: orderPrice,
        customer,
      });

      const ordersDishes = payload.dishes.map<Omit<OrdersDishes, 'id'>>(
        (dish) => ({ dish, order }),
      );

      const createdRelations = await transaction.manager.save(
        OrdersDishes,
        ordersDishes,
      );

      await transaction.commit();
      const orderWithDishes = { ...order, ordersDishes: createdRelations };

      return this.formatResponse(orderWithDishes);
    } catch (error) {
      console.log(error);

      await transaction.rollback();
      throw new Error('Failed to create order');
    }
  }

  public async changeStatus(order: Order | OrderData, status: OrderStatus) {
    await this.ordersRepository.update(order.id, { status });
    order.status = status;

    this.ordersSocketGateway.notifyStatusChange({
      id: order.id,
      orderNumber: order.orderNumber,
      status,
    });

    return order;
  }

  public getActiveCount() {
    return this.ordersRepository
      .createQueryBuilder('o')
      .select('COUNT(*)', 'count')
      .where('o.status NOT IN (:...statuses)', {
        statuses: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      })
      .getRawOne();
  }

  private formatResponse(order: Order): OrderData {
    const { ordersDishes, ...targetOrder } = order;

    const dishes = ordersDishes.map(({ dish }) => {
      return this.dishesService.enrichImagePath(dish);
    });

    return Object.assign(targetOrder, { dishes });
  }

  private calculatePrice(dishes: Dish[]): number {
    const price = dishes.reduce((sum, { price }) => {
      return sum + Number(price);
    }, 0);

    return Number(price.toFixed(2));
  }
}
