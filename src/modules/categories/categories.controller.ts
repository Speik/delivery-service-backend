import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './create-category.dto';

import { DishesService } from '../dishes/dishes.service';
import { Public } from '../../decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly dishesService: DishesService,
  ) {}

  @Public()
  @Get()
  public get(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return this.categoriesService.get(limit, offset);
  }

  @Get('search')
  public search(@Query('term') term: string) {
    return this.categoriesService.search(term);
  }

  @Post()
  public async create(@Body() payload: CreateCategoryDto) {
    const category = await this.categoriesService.getByName(payload.name);

    if (category) {
      throw new BadRequestException('Category with such name already exists');
    }

    return this.categoriesService.create(payload);
  }

  @Delete(':id')
  public async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const category = await this.categoriesService.getById(id);

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const linkedDishes = await this.dishesService.getByCategory(category);

    if (linkedDishes.length) {
      const [{ name: dishName }] = linkedDishes;

      throw new BadRequestException(
        `Category is in use at least by '${dishName}'`,
      );
    }

    return this.categoriesService.remove(id);
  }
}
