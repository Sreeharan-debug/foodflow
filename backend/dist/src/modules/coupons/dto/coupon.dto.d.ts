export declare class CreateCouponDto {
    code: string;
    discount: number;
    expiresAt: string;
    isActive?: boolean;
}
export declare class UpdateCouponDto {
    code?: string;
    discount?: number;
    expiresAt?: string;
    isActive?: boolean;
}
