import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { Prisma } from '@prisma/client';
export declare class CouponsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    findByCode(code: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    create(createCouponDto: CreateCouponDto, performedBy: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    update(id: string, updateCouponDto: UpdateCouponDto, performedBy: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: Prisma.Decimal;
        expiresAt: Date;
        isActive: boolean;
    }>;
    remove(id: string, performedBy: string): Promise<{
        message: string;
    }>;
}
