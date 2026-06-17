import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validateCoupon(code: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    getCoupons(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }[]>;
    getCouponById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    createCoupon(createCouponDto: CreateCouponDto, adminEmail: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    updateCoupon(id: string, updateCouponDto: UpdateCouponDto, adminEmail: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    deleteCoupon(id: string, adminEmail: string): Promise<{
        message: string;
    }>;
}
