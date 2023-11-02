import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Dish } from './dish.entity';

@Entity({ name: 'orders_dishes' })
export class OrdersDishes {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => Order, (order) => order.ordersDishes, { eager: true })
  public order: Order;

  @ManyToOne(() => Dish, (dish) => dish.ordersDishes, { eager: true })
  public dish: Dish;
}
