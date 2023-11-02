import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { WsClient, WsOrderEvent } from '../../declarations';
import { Order } from '../../entities/order.entity';

type StatusChangePayload = Pick<Order, 'id' | 'status' | 'orderNumber'>;

const WS_PORT = 81;
const WS_NAMESPACE = 'orders';
const WS_TRANSPORTS = ['websocket'];

@WebSocketGateway(WS_PORT, {
  namespace: WS_NAMESPACE,
  transports: WS_TRANSPORTS,
})
export class OrdersSocketGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger('OrdersSocketGateway');

  @WebSocketServer()
  private server: Server;

  public afterInit() {
    this.logger.verbose(
      `Listening for WS connections on port ${WS_PORT}`,
      `Namespace: ${WS_NAMESPACE}`,
    );
  }

  public handleConnection(client: WsClient) {
    this.logger.verbose(`Client connected: ${client.id}`);
  }

  public notifyStatusChange(payload: StatusChangePayload) {
    const orderNumber = String(payload.orderNumber).padStart(4, '0');
    const status = payload.status.charAt(0) + payload.status.slice(1);

    this.server.emit(WsOrderEvent.STATUS_CHANGE, payload);

    this.logger.verbose(
      `Order (No. ${orderNumber}) status changed to '${status}'`,
    );
  }
}
