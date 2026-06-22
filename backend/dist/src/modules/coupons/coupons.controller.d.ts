import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validateCoupon(code: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    getCoupons(adminUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }[]>;
    getCouponById(id: string, adminUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    createCoupon(createCouponDto: CreateCouponDto, adminUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    updateCoupon(id: string, updateCouponDto: UpdateCouponDto, adminUser: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    deleteCoupon(id: string, adminUser: any): Promise<{
        message: string;
    }>;
}
