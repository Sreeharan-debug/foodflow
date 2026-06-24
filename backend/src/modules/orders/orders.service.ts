import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { EmailService } from '../email/email.service';

import { PaymentsService } from '../payments/payments.service';
import { InvoiceService } from '../payments/invoice.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private wsGateway: WebsocketGateway,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
    private invoiceService: InvoiceService,
  ) {}

  async checkout(userId: string, checkoutDto: CheckoutDto) {
    const { addressId, couponCode, paymentMethod } = checkoutDto;

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

    // 3. Calculate subtotal using Decimal and validate single restaurant
    if (!cart.items[0]?.food?.restaurantId) {
      throw new BadRequestException('Food items in the cart must belong to a restaurant.');
    }
    const restaurantId = cart.items[0].food.restaurantId;

    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      if (item.food.restaurantId !== restaurantId) {
        throw new BadRequestException('All items in your cart must be from the same restaurant.');
      }
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

    // 7. Create Order (sequential ops — avoids Neon P2028 interactive-transaction timeout)
    const order = await this.prisma.order.create({
      data: {
        userId,
        addressId,
        couponId,
        restaurantId,
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
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
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
    let razorpayOrder = null;
    if (paymentMethod !== 'COD') {
      razorpayOrder = await this.paymentsService.createRazorpayOrder(order.id, userId);
    }

    // Send Order Confirmation Email (Fire and Forget)
    this.emailService.sendOrderConfirmationEmail(
      order.user.name,
      order.user.email,
      order.id,
      order.total.toString(),
    ).catch((err) => {
      console.error('[Email Error] checkout order confirmation email failed:', err);
    });

    return { order, razorpayOrder };
  }

  async findAll(userId: string, role: Role, restaurantId?: string) {
    if (role === Role.ADMIN) {
      return this.prisma.order.findMany({
        where: { restaurantId },
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

    if (role === Role.SUPER_ADMIN) {
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

  async findOne(userId: string, role: Role, orderId: string, restaurantId?: string) {
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

    if (role === Role.ADMIN) {
      if (order.restaurantId !== restaurantId) {
        throw new BadRequestException('You do not have access to view this order');
      }
    } else if (role !== Role.SUPER_ADMIN && order.userId !== userId) {
      throw new BadRequestException('You do not have access to view this order');
    }

    return order;
  }

  async updateStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto, performedBy: string, restaurantId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { food: true } },
        address: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (restaurantId && order.restaurantId !== restaurantId) {
      throw new BadRequestException('You do not have permission to update this order');
    }

    // If order is COD (no payments) and status is updated to DELIVERED, set paymentStatus to 'PAID'
    const isCod = !order.payments || order.payments.length === 0;
    const updateData: Prisma.OrderUpdateInput = { status: updateOrderStatusDto.status };
    if (isCod && updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      updateData.paymentStatus = 'PAID';
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, name: true, firstName: true } },
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

    // Send Order Status Update Email (Fire and Forget)
    this.emailService.sendOrderStatusUpdateEmail(
      updatedOrder.user.name,
      updatedOrder.user.email,
      updatedOrder.id,
      updatedOrder.status,
    ).catch((err) => {
      console.error('[Email Error] status update email failed:', err);
    });

    // Generate Invoice for COD order when delivered
    if (isCod && updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      try {
        const generated = await this.invoiceService.generateInvoicePdf(updatedOrder, {
          paymentMethod: 'COD',
        });
        const pdfUrl = generated.pdfUrl;
        const pdfBuffer = generated.pdfBuffer;

        const invoiceNumber = `INV-${new Date().getFullYear()}-${updatedOrder.id.substring(0, 8).toUpperCase()}`;
        await this.prisma.invoice.create({
          data: {
            invoiceNumber,
            orderId: updatedOrder.id,
            customerId: updatedOrder.userId,
            pdfUrl,
          },
        });

        const userFirstName = (updatedOrder.user as any).firstName || updatedOrder.user.name.split(' ')[0] || 'Customer';
        // Send payment success email with attachment
        this.emailService
          .sendPaymentSuccessEmailWithAttachment(
            updatedOrder.user.email,
            userFirstName,
            'COD-' + updatedOrder.id.substring(0, 8).toUpperCase(),
            updatedOrder.id,
            updatedOrder.total.toString(),
            `invoice-${updatedOrder.id}.pdf`,
            pdfBuffer,
          )
          .catch((err) => console.error('[Email Error] COD invoice success email failed:', err));

      } catch (invoiceErr) {
        console.error('COD Invoice generation/db save failed:', invoiceErr);
      }
    }

    // If status is DELIVERED, trigger Review Request Email after a brief delay (Fire and Forget)
    if (updatedOrder.status === 'DELIVERED') {
      setTimeout(() => {
        this.emailService.sendReviewRequestEmail(
          updatedOrder.user.name,
          updatedOrder.user.email,
          updatedOrder.id,
        ).catch((err) => {
          console.error('[Email Error] review request email failed:', err);
        });
      }, 5000); // 5 seconds delay
    }

    return updatedOrder;
  }
}
