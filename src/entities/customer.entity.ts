import { Column, Entity, Generated, OneToMany } from 'typeorm';

import {
  PaymentMethod,
  OrderType,
  MAX_CUSTOMER_NAME_LENGTH,
  MAX_ADDRESS_LENGTH,
} from 'src/declarations';

import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

@Entity({ name: 'customers' })
export class Customer extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  public customerNumber: number;

  @Column({ unique: true, nullable: false })
  public phone: string;

  @Column({
    type: 'varchar',
    length: MAX_CUSTOMER_NAME_LENGTH,
    nullable: false,
  })
  public name: string;

  @Column({ type: 'varchar', length: MAX_ADDRESS_LENGTH, nullable: true })
  public address: string | null;

  @Column({ type: 'enum', enum: PaymentMethod })
  public preferredPayment: PaymentMethod;

  @Column({ type: 'enum', enum: OrderType })
  public preferredOrder: OrderType;

  @OneToMany(() => Order, (order) => order.customer)
  public orders: Order[];
}
