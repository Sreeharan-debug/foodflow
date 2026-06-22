import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { Prisma } from '@prisma/client';
export declare class CouponsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(restaurantId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }[]>;
    findOne(id: string, restaurantId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    findByCode(code: string, restaurantId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    create(createCouponDto: CreateCouponDto, performedBy: string, restaurantId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    update(id: string, updateCouponDto: UpdateCouponDto, performedBy: string, restaurantId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    remove(id: string, performedBy: string, restaurantId?: string): Promise<{
        message: string;
    }>;
}
