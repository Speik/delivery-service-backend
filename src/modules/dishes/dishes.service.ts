import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  ILike,
  Repository,
  In,
  FindOptionsWhere,
  IsNull,
} from 'typeorm';

import { CreateDishDto, UpdateDishDto } from './dto';
import { FileStorage, TransactionFactory } from 'src/shared';

import { Dish } from 'src/entities/dish.entity';
import { Category } from 'src/entities/category.entity';
import { OrdersDishes } from '../../entities/orders-dishes.entity';

type ExtendedPayload = { category?: Category; image?: MulterFile };
type CreateDishPayload = Omit<CreateDishDto, 'categoryId'> & ExtendedPayload;
type UpdateDishPayload = Omit<UpdateDishDto, 'categoryId'> & ExtendedPayload;

type GetDishesParams = {
  limit: number;
  offset: number;
  isAuthenticated: boolean;
};

type SearchDishesParams = {
  isAuthenticated: boolean;
  term?: string;
  categoryId?: string;
};

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(OrdersDishes)
    private ordersDishesRepository: Repository<OrdersDishes>,
    @InjectRepository(Dish) private dishesRepository: Repository<Dish>,
    private readonly fileStorage: FileStorage,
    private dataSource: DataSource,
  ) {}

  public async search({
    term,
    categoryId,
    isAuthenticated,
  }: SearchDishesParams) {
    const whereOptions: FindOptionsWhere<Dish> = {};

    if (term) {
      whereOptions.name = ILike(`%${term}%`);
    }

    if (categoryId) {
      whereOptions.category = { id: categoryId };
    }

    if (!isAuthenticated) {
      whereOptions.deletedAt = IsNull();
      whereOptions.visible = true;
    }

    const dishes = await this.dishesRepository.find({
      where: whereOptions,
      order: { createdAt: 'DESC' },
      relations: ['category'],
    });

    return dishes.map(this.enrichImagePath.bind(this));
  }

  public setVisibility(id: string, visible: boolean) {
    return this.dishesRepository.update(id, { visible });
  }

  public async get({ limit, offset, isAuthenticated }: GetDishesParams) {
    const whereOptions: FindOptionsWhere<Dish> = {};

    if (!isAuthenticated) {
      whereOptions.deletedAt = IsNull();
      whereOptions.visible = true;
    }

    const dishes = await this.dishesRepository.find({
      where: whereOptions,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['category'],
    });

    return dishes.map(this.enrichImagePath.bind(this));
  }

  public async getById(id: string): Promise<Dish | null>;
  public async getById(id: string[]): Promise<Dish[]>;
  public async getById(id: string | string[]) {
    const isSingleId = typeof id === 'string';

    if (isSingleId) {
      const dish = await this.dishesRepository.findOne({
        where: { id },
      });

      return dish ? this.enrichImagePath(dish) : null;
    }

    const dishes = await this.dishesRepository.find({
      where: { id: In(id) },
    });

    return dishes.map(this.enrichImagePath.bind(this));
  }

  public async getByCategory(category: Category) {
    const dishes = await this.dishesRepository.find({
      where: { category: { id: category.id } },
    });

    return dishes.map(this.enrichImagePath.bind(this));
  }

  public async getTopDishes(count: number) {
    const dishes = await this.ordersDishesRepository
      .createQueryBuilder('od')
      .select([
        'd.id AS id',
        'd."createdAt" AS "createdAt"',
        'd."updatedAt" AS "updatedAt"',
        'd.name AS name',
        'd.description AS description',
        'd.image AS image',
        'd.price AS price',
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'createdAt', c."createdAt",
          'updatedAt', c."updatedAt"
         ) AS category`,
      ])
      .addSelect('COUNT(*)', 'orders')
      .leftJoin('dishes', 'd', 'd.id = od."dishId"')
      .leftJoin('d.category', 'c')
      .where('d.visible IS TRUE')
      .andWhere('d."deletedAt" IS NULL')
      .groupBy('d.id')
      .addGroupBy('c.id')
      .orderBy('orders', 'DESC')
      .limit(count)
      .getRawMany();

    return dishes.map(this.enrichImagePath.bind(this));
  }

  public async create(payload: CreateDishPayload) {
    const { image, ...newDish } = payload;

    if (!image) {
      return this.dishesRepository.save(newDish) as Promise<Dish>;
    }

    const imageName = await this.fileStorage.save(
      image,
      FileStorage.Destination.DISHES,
    );

    const dish = await this.dishesRepository.save({
      ...newDish,
      image: imageName,
    });

    return this.enrichImagePath(dish);
  }

  public async update(dish: Dish, payload: UpdateDishPayload) {
    const { image, ...updatedDish } = payload;

    if (dish.category && !payload.category) {
      updatedDish.category = null!;
    }

    if (dish.description && !payload.description) {
      updatedDish.description = null!;
    }

    if (!image) {
      await this.dishesRepository.update(dish.id, updatedDish);
      return this.getById(dish.id);
    }

    if (dish.image) {
      const imageName = this.parseImageName(dish.image);
      await this.fileStorage.delete(imageName, FileStorage.Destination.DISHES);
    }

    const imageName = await this.fileStorage.save(
      image,
      FileStorage.Destination.DISHES,
    );

    await this.dishesRepository.update(dish.id, {
      ...updatedDish,
      image: imageName,
    });

    return this.getById(dish.id);
  }

  public async remove(dish: Dish) {
    const transaction = await TransactionFactory.create(this.dataSource);

    try {
      await transaction.manager.softDelete(Dish, { id: dish.id });
      await transaction.manager.update(
        Dish,
        { id: dish.id },
        { category: null },
      );

      await transaction.commit();

      return { deleted: true };
    } catch (error) {
      await transaction.rollback();

      console.error(error);
      throw new Error('Failed to delete dish');
    }
  }

  public enrichImagePath(dish: Dish) {
    if (!dish.image) return dish;

    // We guarantee that image won't be modified twice or more times
    const dishImage = dish.image.split('/').pop() ?? 'unknown';

    dish.image = this.fileStorage.resolveFilePath(
      dishImage,
      FileStorage.Destination.DISHES,
    );

    return dish;
  }

  private parseImageName(image: string) {
    return image.split('/').pop() ?? image;
  }
}
