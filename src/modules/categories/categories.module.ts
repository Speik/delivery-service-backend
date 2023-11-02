import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from 'src/entities/category.entity';

import { DishesModule } from '../dishes/dishes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    forwardRef(() => DishesModule),
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
