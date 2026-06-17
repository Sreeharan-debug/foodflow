import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinOrderRoom')
  handleJoinOrderRoom(client: Socket, orderId: string) {
    client.join(`order_${orderId}`);
    this.logger.log(`Client ${client.id} joined order room: order_${orderId}`);
    return { status: 'joined', room: `order_${orderId}` };
  }

  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(client: Socket) {
    client.join('admin_orders');
    this.logger.log(`Client ${client.id} joined admin orders queue room`);
    return { status: 'joined', room: 'admin_orders' };
  }

  broadcastOrderCreated(order: any) {
    if (this.server) {
      this.server.to('admin_orders').emit('order.created', order);
    }
  }

  broadcastOrderUpdated(orderId: string, status: string, order: any) {
    if (this.server) {
      this.server.to(`order_${orderId}`).emit('order.updated', { orderId, status, order });
      this.server.to('admin_orders').emit('order.updated', { orderId, status, order });
    }
  }
}
