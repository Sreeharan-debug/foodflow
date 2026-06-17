"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebsocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WebsocketGateway = WebsocketGateway_1 = class WebsocketGateway {
    server;
    logger = new common_1.Logger(WebsocketGateway_1.name);
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinOrderRoom(client, orderId) {
        client.join(`order_${orderId}`);
        this.logger.log(`Client ${client.id} joined order room: order_${orderId}`);
        return { status: 'joined', room: `order_${orderId}` };
    }
    handleJoinAdminRoom(client) {
        client.join('admin_orders');
        this.logger.log(`Client ${client.id} joined admin orders queue room`);
        return { status: 'joined', room: 'admin_orders' };
    }
    broadcastOrderCreated(order) {
        if (this.server) {
            this.server.to('admin_orders').emit('order.created', order);
        }
    }
    broadcastOrderUpdated(orderId, status, order) {
        if (this.server) {
            this.server.to(`order_${orderId}`).emit('order.updated', { orderId, status, order });
            this.server.to('admin_orders').emit('order.updated', { orderId, status, order });
        }
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinOrderRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleJoinOrderRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinAdminRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleJoinAdminRoom", null);
exports.WebsocketGateway = WebsocketGateway = WebsocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)()
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map