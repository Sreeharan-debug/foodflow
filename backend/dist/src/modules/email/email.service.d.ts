import { PrismaService } from '../../prisma/prisma.service';
export declare class EmailService {
    private prisma;
    private resend;
    private enabled;
    constructor(prisma: PrismaService);
    sendWelcomeEmail(firstName: string, email: string): Promise<void>;
    sendOrderConfirmationEmail(fullName: string, email: string, orderId: string, total: string): Promise<void>;
    sendPaymentSuccessEmail(email: string, firstName: string, paymentId: string, orderId: string, amount: string): Promise<void>;
    sendPaymentSuccessEmailWithAttachment(email: string, firstName: string, paymentId: string, orderId: string, amount: string, filename: string, pdfBuffer: Buffer): Promise<void>;
    sendOrderStatusUpdateEmail(fullName: string, email: string, orderId: string, status: string): Promise<void>;
    sendReviewRequestEmail(fullName: string, email: string, orderId: string): Promise<void>;
    private sendMail;
}
