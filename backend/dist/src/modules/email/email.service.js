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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const resend_1 = require("resend");
let EmailService = class EmailService {
    prisma;
    resend = null;
    enabled = false;
    constructor(prisma) {
        this.prisma = prisma;
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey || resendApiKey.startsWith('mock')) {
            console.warn('[EmailService] RESEND_API_KEY is missing or set to mock. Email sending will be in MOCK mode.');
        }
        else {
            try {
                this.resend = new resend_1.Resend(resendApiKey);
                this.enabled = true;
                console.log('[EmailService] Resend client initialized successfully.');
            }
            catch (err) {
                console.error('[EmailService] Failed to initialize Resend client:', err);
            }
        }
    }
    async sendWelcomeEmail(firstName, email) {
        const subject = 'Welcome to FOODFLOW 🍽️';
        const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">FOODFLOW</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Premium Real-Time Food Delivery</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Welcome to FOODFLOW, ${firstName}!</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 24px; line-height: 1.6;">
            We are absolutely thrilled to have you join our premium dining community. Explore mouth‑watering Indian dishes, place orders instantly, and track deliveries in real‑time.
          </p>
          
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 14px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">What you can do now:</h3>
            <ul style="margin: 0; padding: 0; list-style: none; font-size: 14.5px; color: #374151;">
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Browse master-crafted Indian categories (Kerala Specials, Arabian, etc.)
              </li>
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Add items to your cart and apply discount coupons
              </li>
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Pay securely using the integrated Razorpay screen
              </li>
              <li style="margin-bottom: 0; display: flex; align-items: center;">
                <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> Rate and review your meals once delivered
              </li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/customer/menu" style="background: #ea580c; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.15);">Order Delicious Food</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Happy Ordering!<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;
        await this.sendMail(email, subject, html);
    }
    async sendOrderConfirmationEmail(fullName, email, orderId, total) {
        const firstName = fullName.split(' ')[0];
        const subject = `Order Confirmed: #${orderId.substring(0, 8).toUpperCase()} 🍽️`;
        let itemsHtml = '';
        let addressHtml = 'Standard Delivery';
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: { include: { food: true } },
                    address: true,
                },
            });
            if (order) {
                itemsHtml = order.items
                    .map((item) => `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3f4f6; padding: 8px 0; font-size: 14px;">
            <span style="color: #4b5563;">${item.food.name} <strong>x${item.quantity}</strong></span>
            <span style="font-weight: 600; color: #111827;">₹${(Number(item.price) * item.quantity).toFixed(2)}</span>
          </div>
        `)
                    .join('');
                const addr = order.address;
                addressHtml = `${addr.houseNumber}, ${addr.buildingName ? addr.buildingName + ', ' : ''}${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
            }
        }
        catch (error) {
            console.error('Failed to fetch details for confirmation email:', error);
        }
        const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Order Confirmed!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Order ID: #${orderId.toUpperCase()}</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Hi ${firstName},</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
            Your order has been confirmed and our chef has started preparing your fresh Indian meal. Here is your order summary:
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; margin-bottom: 12px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; font-size: 14px; font-weight: 700;">ITEMS</h4>
            ${itemsHtml || '<p style="font-size: 14px; color: #6b7280;">Order details unavailable</p>'}
            
            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #e5e7eb; font-weight: bold;">
              <span style="font-size: 14px; color: #111827;">Grand Total:</span>
              <span style="font-size: 15px; color: #10b981;">₹${parseFloat(total).toFixed(2)}</span>
            </div>
          </div>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #111827; font-size: 14px; font-weight: 700;">SHIPPING ADDRESS</h4>
            <p style="font-size: 13.5px; color: #4b5563; margin: 0;">${addressHtml}</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/customer/orders" style="background: #10b981; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15);">Track Delivery Live</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Enjoy your meal!<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;
        await this.sendMail(email, subject, html);
    }
    async sendPaymentSuccessEmail(email, firstName, paymentId, orderId, amount) {
        const subject = `Payment Successful: ₹${parseFloat(amount).toFixed(2)} 💳`;
        const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Payment Successful!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Receipt & Transaction Invoice</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Hi ${firstName},</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
            Thank you! Your payment of <strong>₹${parseFloat(amount).toFixed(2)}</strong> has been successfully processed via Razorpay.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #6b7280;">Transaction ID:</span>
              <span style="font-weight: 600; color: #111827;">${paymentId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #6b7280;">Order Reference:</span>
              <span style="font-weight: 600; color: #111827;">#${orderId.substring(0, 8).toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 8px;">
              <span style="color: #111827;">Amount Paid:</span>
              <span style="color: #4f46e5;">₹${parseFloat(amount).toFixed(2)}</span>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            If you have any questions, feel free to reply directly to this email.<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;
        await this.sendMail(email, subject, html);
    }
    async sendPaymentSuccessEmailWithAttachment(email, firstName, paymentId, orderId, amount, filename, pdfBuffer) {
        const subject = `Payment Successful & Invoice: ₹${parseFloat(amount).toFixed(2)} 💳`;
        const base64Content = pdfBuffer.toString('base64');
        const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Payment Successful!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Receipt & Transaction Invoice Attached</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Hi ${firstName},</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
            Thank you! Your payment of <strong>₹${parseFloat(amount).toFixed(2)}</strong> has been successfully processed via Razorpay.
          </p>
          <p style="font-size: 14.5px; color: #4b5563; margin-bottom: 20px;">
            We have generated a PDF invoice for this order and attached it to this email. You can also view it on your profile dashboard.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #6b7280;">Transaction ID:</span>
              <span style="font-weight: 600; color: #111827;">${paymentId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: #6b7280;">Order Reference:</span>
              <span style="font-weight: 600; color: #111827;">#${orderId.substring(0, 8).toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 8px;">
              <span style="color: #111827;">Amount Paid:</span>
              <span style="color: #4f46e5;">₹${parseFloat(amount).toFixed(2)}</span>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            If you have any questions, feel free to reply directly to this email.<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;
        await this.sendMail(email, subject, html, [{ filename, content: base64Content }]);
    }
    async sendOrderStatusUpdateEmail(fullName, email, orderId, status) {
        const firstName = fullName.split(' ')[0];
        let statusText = status;
        let statusColor = '#f97316';
        let emoji = '📦';
        if (status === 'CONFIRMED') {
            statusText = 'Confirmed';
            statusColor = '#10b981';
            emoji = '✅';
        }
        else if (status === 'PREPARING') {
            statusText = 'Preparing';
            statusColor = '#ea580c';
            emoji = '👨‍🍳';
        }
        else if (status === 'OUT_FOR_DELIVERY') {
            statusText = 'Out for Delivery';
            statusColor = '#3b82f6';
            emoji = '🛵';
        }
        else if (status === 'DELIVERED') {
            statusText = 'Delivered';
            statusColor = '#10b981';
            emoji = '🎉';
        }
        else if (status === 'CANCELLED') {
            statusText = 'Cancelled';
            statusColor = '#ef4444';
            emoji = '❌';
        }
        else if (status === 'PENDING') {
            statusText = 'Pending';
            statusColor = '#eab308';
            emoji = '⏳';
        }
        const subject = `Your FOODFLOW Order is ${statusText} ${emoji}`;
        const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, ${statusColor} 0%, #1f2937 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Order ${statusText}!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Order ID: #${orderId.toUpperCase()}</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Hi ${firstName},</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
            Your order status has been updated to <strong>${statusText}</strong>.
          </p>
          
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <span style="font-size: 48px;">${emoji}</span>
            <h3 style="margin: 12px 0 4px 0; color: #111827; font-size: 18px;">${statusText}</h3>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">We are processing your order as fast as possible.</p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/customer/orders" style="background: #ea580c; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.15);">Track Your Order</a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Thank you for choosing FOODFLOW!<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;
        await this.sendMail(email, subject, html);
    }
    async sendReviewRequestEmail(fullName, email, orderId) {
        const firstName = fullName.split(' ')[0];
        const subject = 'How was your meal? ⭐';
        const html = `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">How was your meal?</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Order ID: #${orderId.toUpperCase()}</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Hi ${firstName},</h2>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
            We hope you enjoyed your recent order from FOODFLOW! We would love to hear your feedback on the food and service.
          </p>

          <div style="text-align: center; margin-bottom: 24px; padding: 12px 0;">
            <span style="font-size: 24px; color: #f59e0b; letter-spacing: 4px;">⭐⭐⭐⭐⭐</span>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/customer/orders" style="background: #ea580c; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.15);">Write a Review</a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Thank you for your feedback!<br />
            <strong>The FOODFLOW Team</strong>
          </p>
        </div>
      </div>
    `;
        await this.sendMail(email, subject, html);
    }
    async sendMail(to, subject, html, attachments) {
        const fromEmail = process.env.EMAIL_FROM || 'FOODFLOW <onboarding@resend.dev>';
        if (!this.enabled || !this.resend) {
            console.log(`[EmailService] [MOCK EMAIL] Sent to: ${to}, Subject: ${subject}`);
            if (attachments && attachments.length > 0) {
                console.log(`[EmailService] [MOCK EMAIL] Attachments: ${attachments.map(a => a.filename).join(', ')}`);
            }
            return;
        }
        try {
            const mappedAttachments = attachments?.map(att => ({
                filename: att.filename,
                content: typeof att.content === 'string' ? Buffer.from(att.content, 'base64') : att.content
            }));
            const { data, error } = await this.resend.emails.send({
                from: fromEmail,
                to: [to],
                subject,
                html,
                attachments: mappedAttachments,
            });
            if (error) {
                console.error('[EmailService] Resend API error:', error);
            }
            else {
                console.log(`[EmailService] Resend successfully sent email to ${to}, ID: ${data?.id}`);
            }
        }
        catch (err) {
            console.error('[EmailService] Resend transmission failed:', err);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map