import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Category } from 'src/entities/category.entity';
import { CreateCategoryDto } from './create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  public get(limit: number, offset: number) {
    return this.categoriesRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  public search(term: string) {
    return this.categoriesRepository.find({
      where: { name: ILike(`%${term}%`) },
      order: { createdAt: 'DESC' },
    });
  }

  public getByName(name: string) {
    return this.categoriesRepository.findOne({ where: { name } });
  }

  public getById(id: string) {
    return this.categoriesRepository.findOne({ where: { id } });
  }

  public async create(data: CreateCategoryDto) {
    const { name } = data;
    const createdCategory = await this.categoriesRepository.save({
      name: name.trim(),
    });

    return createdCategory as Category;
  }

  public remove(id: string) {
    return this.categoriesRepository.delete({ id });
  }
}
