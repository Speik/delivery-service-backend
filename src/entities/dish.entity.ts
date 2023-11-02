import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { OrdersDishes } from './orders-dishes.entity';

@Entity({ name: 'dishes' })
export class Dish extends BaseEntity {
  @Column({ nullable: false })
  public name: string;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  public price: number;

  @Column({ nullable: false, default: true })
  public visible: boolean;

  @Column({ nullable: true, default: null })
  public description?: string;

  @Column({ nullable: true, default: null })
  public image?: string;

  @DeleteDateColumn()
  public deletedAt?: Date;

  @ManyToOne(() => Category, (category) => category.dishes, {
    nullable: true,
    eager: true,
  })
  public category?: Category | null;

  @OneToMany(() => OrdersDishes, (ordersDishes) => ordersDishes.dish)
  public ordersDishes: OrdersDishes[];
}
