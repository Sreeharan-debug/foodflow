import { Controller, Post, Body, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Controller()
export class RazorpayController {
  private razorpay: Razorpay | null = null;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  @Post('create-order')
  async createOrder(
    @Body() body: { amount: number; currency: string; receipt?: string },
  ) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || !this.razorpay) {
      throw new UnauthorizedException('Razorpay credentials are not configured on the server');
    }

    const { amount, currency, receipt } = body;

    if (!amount || amount < 100) {
      throw new BadRequestException('Amount must be at least 100 paise');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount,
        currency: currency || 'INR',
        receipt: receipt || `rec_${Date.now()}`,
      });

      return {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error);
      throw new InternalServerErrorException(`Razorpay API error: ${error.message}`);
    }
  }

  @Post('verify-payment')
  async verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new BadRequestException('Missing required fields: razorpay_order_id, razorpay_payment_id, or razorpay_signature');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new InternalServerErrorException('Razorpay secret key not configured on server');
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature verification failed');
    }

    return {
      status: 'success',
      message: 'Payment verified successfully',
    };
  }
}
