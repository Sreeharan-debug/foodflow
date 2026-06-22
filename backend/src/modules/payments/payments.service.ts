import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { EmailService } from '../email/email.service';
import { InvoiceService } from './invoice.service';
import { OrderStatus } from '@prisma/client';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay | null = null;

  constructor(
    private prisma: PrismaService,
    private wsGateway: WebsocketGateway,
    private emailService: EmailService,
    private invoiceService: InvoiceService,
  ) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[PaymentsService] Razorpay key_id or key_secret is missing.');
    } else {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  async createRazorpayOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Unauthorized to pay for this order');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    if (!this.razorpay) {
      throw new BadRequestException('Razorpay gateway is not configured on the server.');
    }

    const amountInPaise = Math.round(Number(order.total) * 100);

    try {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.id,
      });

      // Save Payment record in database
      await this.prisma.payment.upsert({
        where: { razorpayOrderId: razorpayOrder.id },
        update: {
          amount: order.total,
          status: 'PENDING',
        },
        create: {
          orderId: order.id,
          razorpayOrderId: razorpayOrder.id,
          amount: order.total,
          status: 'PENDING',
        },
      });

      return {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      };
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error);
      throw new BadRequestException(`Failed to initialize Razorpay payment: ${error.message}`);
    }
  }

  async verifyPayment(body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Retrieve payment and order
    const payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { order: { include: { user: true, items: { include: { food: true } }, address: true } } },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record for Razorpay Order ID ${razorpay_order_id} not found`);
    }

    const order = payment.order;

    if (order.paymentStatus === 'PAID') {
      return { status: 'success', message: 'Payment already verified', order };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new BadRequestException('Razorpay secret key not configured on server');
    }

    // Standard Razorpay signature verification
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      // Mark payment as failed in DB
      await this.prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: 'FAILED' },
      });
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });
      throw new BadRequestException('Invalid payment signature verification failed');
    }

    // Success transaction update
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'SUCCESS',
        },
      });

      // Update order status and payment status
      return tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: 'PAID',
        },
        include: {
          user: true,
          items: { include: { food: true } },
          address: true,
          restaurant: true,
        },
      });
    });

    // Generate and store PDF Invoice
    let pdfBuffer: Buffer | null = null;
    let pdfUrl = '';
    try {
      const generated = await this.invoiceService.generateInvoicePdf(updatedOrder, {
        razorpayPaymentId: razorpay_payment_id,
      });
      pdfUrl = generated.pdfUrl;
      pdfBuffer = generated.pdfBuffer;

      const invoiceNumber = `INV-${new Date().getFullYear()}-${updatedOrder.id.substring(0, 8).toUpperCase()}`;
      await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          orderId: updatedOrder.id,
          customerId: updatedOrder.userId,
          pdfUrl,
        },
      });
    } catch (invoiceErr) {
      console.error('Invoice generation/db save failed:', invoiceErr);
    }

    // Send emails in the background
    const userFirstName = updatedOrder.user.firstName || updatedOrder.user.name.split(' ')[0] || 'Customer';
    
    // Order Confirmation Email
    this.emailService
      .sendOrderConfirmationEmail(
        updatedOrder.user.name,
        updatedOrder.user.email,
        updatedOrder.id,
        updatedOrder.total.toString(),
      )
      .catch((err) => console.error('[Email Error] verifyPayment order confirmation failed:', err));

    // Payment Success Email
    if (pdfBuffer) {
      this.emailService
        .sendPaymentSuccessEmailWithAttachment(
          updatedOrder.user.email,
          userFirstName,
          razorpay_payment_id,
          updatedOrder.id,
          updatedOrder.total.toString(),
          `invoice-${updatedOrder.id}.pdf`,
          pdfBuffer,
        )
        .catch((err) => console.error('[Email Error] verifyPayment payment success with attachment failed:', err));
    } else {
      this.emailService
        .sendPaymentSuccessEmail(
          updatedOrder.user.email,
          userFirstName,
          razorpay_payment_id,
          updatedOrder.id,
          updatedOrder.total.toString(),
        )
        .catch((err) => console.error('[Email Error] verifyPayment payment success failed:', err));
    }

    // WebSocket Broadcast
    this.wsGateway.broadcastOrderUpdated(updatedOrder.id, OrderStatus.CONFIRMED, updatedOrder);

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        action: 'VERIFY_PAYMENT_SUCCESS',
        performedBy: updatedOrder.user.email,
        entityType: 'ORDER',
        entityId: updatedOrder.id,
      },
    });

    return { status: 'success', message: 'Payment verified successfully', order: updatedOrder };
  }
}
