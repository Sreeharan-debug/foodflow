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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const client_1 = require("@prisma/client");
const email_service_1 = require("../email/email.service");
let OrdersService = class OrdersService {
    prisma;
    wsGateway;
    emailService;
    constructor(prisma, wsGateway, emailService) {
        this.prisma = prisma;
        this.wsGateway = wsGateway;
        this.emailService = emailService;
    }
    async checkout(userId, checkoutDto) {
        const { addressId, couponCode } = checkoutDto;
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { food: true },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new common_1.BadRequestException('Your shopping cart is empty');
        }
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new common_1.NotFoundException('Selected shipping address not found');
        }
        let subtotal = new client_1.Prisma.Decimal(0);
        for (const item of cart.items) {
            const price = new client_1.Prisma.Decimal(item.food.price);
            subtotal = subtotal.add(price.mul(item.quantity));
        }
        const tax = subtotal.mul(0.08);
        let discount = new client_1.Prisma.Decimal(0);
        let couponId = null;
        if (couponCode) {
            const coupon = await this.prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() },
            });
            if (!coupon || !coupon.isActive || new Date() > coupon.expiresAt) {
                throw new common_1.BadRequestException('The coupon code is invalid or has expired');
            }
            couponId = coupon.id;
            if (coupon.discount.lte(1.0)) {
                discount = subtotal.mul(coupon.discount);
            }
            else {
                discount = coupon.discount;
            }
            if (discount.gt(subtotal)) {
                discount = subtotal;
            }
        }
        let total = subtotal.add(tax).sub(discount);
        if (total.lt(0)) {
            total = new client_1.Prisma.Decimal(0);
        }
        const order = await this.prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    addressId,
                    couponId,
                    tax,
                    discount,
                    total,
                    status: client_1.OrderStatus.PENDING,
                    items: {
                        create: cart.items.map((item) => ({
                            foodId: item.foodId,
                            price: item.food.price,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: {
                    items: {
                        include: { food: true },
                    },
                    address: true,
                    user: {
                        select: { id: true, email: true, name: true },
                    },
                },
            });
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return createdOrder;
        });
        this.wsGateway.broadcastOrderCreated(order);
        await this.prisma.auditLog.create({
            data: {
                action: 'CREATE_ORDER',
                performedBy: order.user.email,
                entityType: 'ORDER',
                entityId: order.id,
            },
        });
        this.emailService
            .sendOrderConfirmationEmail(order.user.name, order.user.email, order.id, order.total.toString())
            .catch((err) => {
            console.error('Failed to send order confirmation email:', err);
        });
        return order;
    }
    async findAll(userId, role) {
        if (role === client_1.Role.ADMIN) {
            return this.prisma.order.findMany({
                include: {
                    user: {
                        select: { id: true, email: true, name: true },
                    },
                    address: true,
                    items: { include: { food: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                address: true,
                items: { include: { food: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, role, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { id: true, email: true, name: true } },
                address: true,
                items: { include: { food: true } },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        if (role !== client_1.Role.ADMIN && order.userId !== userId) {
            throw new common_1.BadRequestException('You do not have access to view this order');
        }
        return order;
    }
    async updateStatus(orderId, updateOrderStatusDto, performedBy) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: { include: { food: true } },
                address: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: updateOrderStatusDto.status },
            include: {
                user: { select: { id: true, email: true, name: true } },
                address: true,
                items: { include: { food: true } },
            },
        });
        this.wsGateway.broadcastOrderUpdated(orderId, updateOrderStatusDto.status, updatedOrder);
        await this.prisma.auditLog.create({
            data: {
                action: `UPDATE_ORDER_STATUS_${updateOrderStatusDto.status}`,
                performedBy,
                entityType: 'ORDER',
                entityId: orderId,
            },
        });
        return updatedOrder;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        websocket_gateway_1.WebsocketGateway,
        email_service_1.EmailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map