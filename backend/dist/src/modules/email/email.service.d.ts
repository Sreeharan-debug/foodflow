export declare class EmailService {
    sendWelcomeEmail(fullName: string, email: string): Promise<void>;
    sendOrderConfirmationEmail(fullName: string, email: string, orderId: string, total: string): Promise<void>;
    private sendMail;
}
