import { Module } from '@nestjs/common';

import { DishesModule } from '../dishes/dishes.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [DishesModule, CustomersModule, OrdersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
