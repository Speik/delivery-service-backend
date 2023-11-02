import { Column, Entity, Generated, ManyToOne, OneToMany } from 'typeorm';

import {
  PaymentMethod,
  OrderType,
  OrderStatus,
  MAX_COMMENT_LENGTH,
  MAX_ADDRESS_LENGTH,
} from 'src/declarations';

import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';
import { OrdersDishes } from './orders-dishes.entity';

@Entity({ name: 'orders' })
export class Order extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  public orderNumber: number;

  @Column({ type: 'enum', enum: OrderStatus })
  public status: OrderStatus;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  public price: number;

  @Column({ type: 'enum', enum: OrderType })
  public type: OrderType;

  @Column({ type: 'enum', enum: PaymentMethod })
  public paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: MAX_COMMENT_LENGTH, nullable: true })
  public comment: string | null;

  @Column({ type: 'varchar', length: MAX_ADDRESS_LENGTH, nullable: true })
  public address: string | null;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  public customer: Customer;

  @OneToMany(() => OrdersDishes, (ordersDishes) => ordersDishes.order)
  public ordersDishes: OrdersDishes[];
}
