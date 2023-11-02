import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DishesService } from '../dishes/dishes.service';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';

import { Customer } from '../../entities/customer.entity';
import { OrderData, OrderType } from '../../declarations';

type GeneralStats = {
  totalIncome: number;
  averageBill: number;
  totalOrders: number;
  uniqueCustomers: number;
};

type DetailedStatsEntry = {
  totalOrders: number;
  totalIncome: number;
  averageTime: number;
};

type DetailedStats = {
  delivery: DetailedStatsEntry;
  takeaway: DetailedStatsEntry;
};

type DailyStats = {
  orders: OrderData[];
  totalIncome: number;
};

type PlatinumCustomer = Customer & {
  totalOrders: number;
};

@Injectable()
export class DashboardService {
  constructor(
    private dataSource: DataSource,
    private dishesService: DishesService,
    private customersService: CustomersService,
    private ordersService: OrdersService,
  ) {}

  public async getGeneralStats(start: Date, end: Date): Promise<GeneralStats> {
    const [{ totalIncome, averageBill, totalOrders }] =
      await this.dataSource.query(
        `
          SELECT
            COALESCE(ROUND(SUM(o.price), 2), 0)::INT as "totalIncome",
            COALESCE(ROUND(AVG(o.price), 2), 0)::INT as "averageBill",
            COUNT(*)::INT as "totalOrders"
          FROM orders o
          WHERE o."createdAt" BETWEEN $1 AND $2
        `,
        [start.toUTCString(), end.toUTCString()],
      );

    const [{ uniqueCustomers }] = await this.dataSource.query(
      `
        SELECT COUNT(*)::INT as "uniqueCustomers"
        FROM customers c
        WHERE c."createdAt" BETWEEN $1 AND $2
      `,
      [start.toUTCString(), end.toUTCString()],
    );

    return { totalIncome, averageBill, totalOrders, uniqueCustomers };
  }

  public async getDetailedStats(
    start: Date,
    end: Date,
  ): Promise<DetailedStats> {
    const statsQuery = `
      SELECT
        COALESCE(
          ROUND(AVG(EXTRACT(EPOCH FROM (o."updatedAt" - o."createdAt"))), 0), 0
        )::INT as "averageTime",
        COUNT(*)::INT as "totalOrders",
        COALESCE(SUM(o.price), 0)::INT as "totalIncome"
      FROM orders o
      WHERE o.type = $1 AND o."createdAt" BETWEEN $2 AND $3
    `;

    const [delivery, takeaway] = await Promise.all(
      Object.values(OrderType).map(async (type) => {
        const [data] = await this.dataSource.query(statsQuery, [
          type,
          start.toUTCString(),
          end.toUTCString(),
        ]);

        return data;
      }),
    );

    return { delivery, takeaway };
  }

  public async getDailyStats(start: Date, end: Date): Promise<DailyStats> {
    type OrdersIds = Array<{ id: string }>;

    const ordersData: OrdersIds = await this.dataSource.query(
      `
        SELECT o.id FROM orders o
        WHERE o."createdAt" BETWEEN $1 AND $2
        ORDER BY o.price DESC
      `,
      [start.toUTCString(), end.toUTCString()],
    );

    const ordersIds = ordersData.map(({ id }) => id);
    const orders = await this.ordersService.getById(ordersIds);

    const totalIncome = orders.reduce((sum, order) => {
      return sum + Number(order.price);
    }, 0);

    return { totalIncome, orders };
  }

  public async getFavoriteDish(start: Date, end: Date) {
    const [favoriteDish] = await this.dataSource.query(
      `
        SELECT od."dishId" AS id, COUNT(*) AS "totalOrders"
        FROM orders_dishes od
        WHERE od."orderId" IN (
          SELECT o.id FROM orders o
          WHERE o."createdAt" BETWEEN $1 AND $2
        )
        GROUP BY od."dishId"
        ORDER BY "totalOrders" DESC
        LIMIT 1
      `,
      [start.toUTCString(), end.toUTCString()],
    );

    return favoriteDish ? this.dishesService.getById(favoriteDish.id) : null;
  }

  public async getPlatinumCustomer(
    start: Date,
    end: Date,
  ): Promise<PlatinumCustomer | null> {
    const [platinumCustomer] = await this.dataSource.query(
      `
        SELECT o."customerId" as id, COUNT(*)::INT AS "totalOrders"
        FROM orders o
        WHERE o."createdAt" BETWEEN $1 AND $2
        GROUP BY o."customerId"
        ORDER BY "totalOrders" DESC
        LIMIT 1
      `,
      [start.toUTCString(), end.toUTCString()],
    );

    if (!platinumCustomer) {
      return null;
    }

    const customerData = await this.customersService.getById(
      platinumCustomer.id,
    );

    return customerData
      ? { ...customerData, totalOrders: platinumCustomer.totalOrders }
      : null;
  }

  public async getCostlyOrder(start: Date, end: Date) {
    const [costlyOrder] = await this.dataSource.query(
      `
        SELECT o.id FROM orders o
        WHERE o."createdAt" BETWEEN $1 AND $2
        ORDER BY o.price DESC
        LIMIT 1
      `,
      [start.toUTCString(), end.toUTCString()],
    );

    return costlyOrder ? this.ordersService.getById(costlyOrder.id) : null;
  }
}
