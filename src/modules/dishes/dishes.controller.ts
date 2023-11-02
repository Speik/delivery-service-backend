import { FileInterceptor } from '@nestjs/platform-express';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { DishesService } from './dishes.service';
import { CreateDishDto, SetVisibilityDto, UpdateDishDto } from './dto';
import { CategoriesService } from '../categories/categories.service';

import { Public } from 'src/decorators/public.decorator';
import { Auth } from 'src/decorators/auth.decorator';

const getFileValidator = () => {
  const fileType = /(jpg|jpeg|png)$/;

  return new ParseFilePipe({
    validators: [new FileTypeValidator({ fileType })],
    fileIsRequired: false,
  });
};

@Controller('dishes')
export class DishesController {
  constructor(
    private readonly dishesService: DishesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Put('visibility/:id')
  public async setVisibility(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { visible }: SetVisibilityDto,
  ) {
    const dish = await this.dishesService.getById(id);

    if (!dish) {
      throw new BadRequestException('Dish not found');
    }

    return this.dishesService.setVisibility(id, visible);
  }

  @Public()
  @Get('search')
  public search(
    @Auth() isAuthenticated: boolean,
    @Query('term') term?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.dishesService.search({
      term,
      categoryId,
      isAuthenticated,
    });
  }

  @Public()
  @Get()
  public get(
    @Auth() isAuthenticated: boolean,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return this.dishesService.get({
      limit,
      offset,
      isAuthenticated,
    });
  }

  @Public()
  @Get('top')
  public getTopDishes(@Query('count', ParseIntPipe) count: number) {
    if (count <= 0) {
      throw new BadRequestException('Count must be positive non-zero value');
    }

    return this.dishesService.getTopDishes(count);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  public async create(
    @Body() payload: CreateDishDto,
    @UploadedFile(getFileValidator()) image?: MulterFile,
  ) {
    if (!payload.categoryId) {
      return this.dishesService.create({ ...payload, image });
    }

    const category = await this.categoriesService.getById(payload.categoryId);

    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    delete payload.categoryId;

    return this.dishesService.create({ ...payload, category, image });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateDishDto,
    @UploadedFile(getFileValidator()) image?: MulterFile,
  ) {
    const dish = await this.dishesService.getById(id);

    if (!dish) {
      throw new BadRequestException('Dish not found');
    }

    if (!payload.categoryId) {
      return this.dishesService.update(dish, { ...payload, image });
    }

    const category = await this.categoriesService.getById(payload.categoryId);

    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    delete payload.categoryId;

    return this.dishesService.update(dish, { ...payload, category, image });
  }

  @Delete(':id')
  public async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const dish = await this.dishesService.getById(id);

    if (!dish) {
      throw new BadRequestException('Dish not found');
    }

    return this.dishesService.remove(dish);
  }
}
