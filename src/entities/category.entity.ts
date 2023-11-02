import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Dish } from './dish.entity';

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
  @Column({ unique: true })
  public name: string;

  @OneToMany(() => Dish, (dish) => dish.category)
  public dishes: Dish[];
}
