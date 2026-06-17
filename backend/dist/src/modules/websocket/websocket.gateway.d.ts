import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinOrderRoom(client: Socket, orderId: string): {
        status: string;
        room: string;
    };
    handleJoinAdminRoom(client: Socket): {
        status: string;
        room: string;
    };
    broadcastOrderCreated(order: any): void;
    broadcastOrderUpdated(orderId: string, status: string, order: any): void;
}
