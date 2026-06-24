import { OrderStatus } from '@prisma/client';
export declare class CheckoutDto {
    addressId: string;
    couponCode?: string;
    paymentMethod?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
