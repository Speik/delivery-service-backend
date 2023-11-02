import { Order } from '../entities/order.entity';
import { Dish } from '../entities/dish.entity';

type OrderData = Omit<Order, 'ordersDishes'> & {
  dishes: Dish[];
};

type WsClient = {
  id: string;
};

export { OrderData, WsClient };
