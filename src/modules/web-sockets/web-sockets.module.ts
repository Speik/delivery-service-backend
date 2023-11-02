import { Global, Module } from '@nestjs/common';
import { OrdersSocketGateway } from './orders.gateway';

@Global()
@Module({
  providers: [OrdersSocketGateway],
  exports: [OrdersSocketGateway],
})
export class WebSocketsModule {}
