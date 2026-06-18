import { PrismaService } from '../../prisma/prisma.service';
export declare class EmailService {
    private prisma;
    constructor(prisma: PrismaService);
    sendWelcomeEmail(firstName: string, email: string): Promise<void>;
    sendOrderConfirmationEmail(fullName: string, email: string, orderId: string, total: string): Promise<void>;
    sendPaymentSuccessEmail(email: string, firstName: string, paymentId: string, orderId: string, amount: string): Promise<void>;
    private sendMail;
}
