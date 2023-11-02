import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DishesModule } from '../dishes/dishes.module';
import { CustomersModule } from '../customers/customers.module';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { Order } from 'src/entities/order.entity';
import { OrdersDishes } from 'src/entities/orders-dishes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrdersDishes]),
    DishesModule,
    CustomersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
