import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { Dish } from 'src/entities/dish.entity';
import { OrdersDishes } from '../../entities/orders-dishes.entity';

import { CategoriesModule } from '../categories/categories.module';
import { FileStorage, TransactionFactory } from '../../shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dish, OrdersDishes]),
    forwardRef(() => CategoriesModule),
  ],
  providers: [DishesService, FileStorage, TransactionFactory],
  controllers: [DishesController],
  exports: [DishesService],
})
export class DishesModule {}
