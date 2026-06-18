import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { EmailService } from '../email/email.service';

import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private wsGateway: WebsocketGateway,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
  ) {}

  async checkout(userId: string, checkoutDto: CheckoutDto) {
    const { addressId, couponCode } = checkoutDto;

    // 1. Get cart items
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { food: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your shopping cart is empty');
    }

    // 2. Validate address
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Selected shipping address not found');
    }

    // 3. Calculate subtotal using Decimal
    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      const price = new Prisma.Decimal(item.food.price);
      subtotal = subtotal.add(price.mul(item.quantity));
    }

    // 4. Calculate Tax (8%)
    const tax = subtotal.mul(0.08);

    // 5. Check coupon if exists
    let discount = new Prisma.Decimal(0);
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive || new Date() > coupon.expiresAt) {
        throw new BadRequestException('The coupon code is invalid or has expired');
      }

      couponId = coupon.id;
      // If coupon discount is <= 1.0, treat as percentage
      if (coupon.discount.lte(1.0)) {
        discount = subtotal.mul(coupon.discount);
      } else {
        discount = coupon.discount;
      }

      if (discount.gt(subtotal)) {
        discount = subtotal; // Discount cannot exceed subtotal
      }
    }

    // 6. Calculate total
    let total = subtotal.add(tax).sub(discount);
    if (total.lt(0)) {
      total = new Prisma.Decimal(0);
    }

    // 7. Execute Checkout Transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          couponId,
          tax,
          discount,
          total,
          status: OrderStatus.PENDING,
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

      // Clear Cart Items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    // 8. WebSocket Broadcast
    this.wsGateway.broadcastOrderCreated(order);

    // 9. Audit Log
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_ORDER',
        performedBy: order.user.email,
        entityType: 'ORDER',
        entityId: order.id,
      },
    });

    // 10. Initialize Razorpay Payment Order
    const razorpayOrder = await this.paymentsService.createRazorpayOrder(order.id, userId);

    return { order, razorpayOrder };
  }

  async findAll(userId: string, role: Role) {
    if (role === Role.ADMIN) {
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

  async findOne(userId: string, role: Role, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        address: true,
        items: { include: { food: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new BadRequestException('You do not have access to view this order');
    }

    return order;
  }

  async updateStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto, performedBy: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { food: true } },
        address: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
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

    // WebSocket Broadcast
    this.wsGateway.broadcastOrderUpdated(orderId, updateOrderStatusDto.status, updatedOrder);

    // Audit Log
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
}
