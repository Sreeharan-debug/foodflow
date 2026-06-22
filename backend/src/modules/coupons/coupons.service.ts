import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId?: string) {
    const where: Prisma.CouponWhereInput = {};
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    return this.prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, restaurantId?: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    if (restaurantId && coupon.restaurantId !== restaurantId) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    return coupon;
  }

  async findByCode(code: string, restaurantId?: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon code "${code}" not found`);
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    if (new Date() > coupon.expiresAt) {
      throw new BadRequestException('This coupon has expired');
    }

    if (restaurantId && coupon.restaurantId && coupon.restaurantId !== restaurantId) {
      throw new BadRequestException('This coupon is not valid for this restaurant');
    }

    return coupon;
  }

  async create(createCouponDto: CreateCouponDto, performedBy: string, restaurantId?: string) {
    const code = createCouponDto.code.toUpperCase();
    
    const existing = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException(`Coupon with code "${code}" already exists`);
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        discount: new Prisma.Decimal(createCouponDto.discount),
        expiresAt: new Date(createCouponDto.expiresAt),
        isActive: createCouponDto.isActive !== undefined ? createCouponDto.isActive : true,
        restaurantId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_COUPON',
        performedBy,
        entityType: 'COUPON',
        entityId: coupon.id,
      },
    });

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto, performedBy: string, restaurantId?: string) {
    const existingCoupon = await this.findOne(id, restaurantId);

    const data: Prisma.CouponUpdateInput = {};
    if (updateCouponDto.code !== undefined) {
      const code = updateCouponDto.code.toUpperCase();
      if (code !== existingCoupon.code) {
        const duplicate = await this.prisma.coupon.findUnique({ where: { code } });
        if (duplicate) {
          throw new ConflictException(`Coupon with code "${code}" already exists`);
        }
      }
      data.code = code;
    }

    if (updateCouponDto.discount !== undefined) {
      data.discount = new Prisma.Decimal(updateCouponDto.discount);
    }

    if (updateCouponDto.expiresAt !== undefined) {
      data.expiresAt = new Date(updateCouponDto.expiresAt);
    }

    if (updateCouponDto.isActive !== undefined) {
      data.isActive = updateCouponDto.isActive;
    }

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_COUPON',
        performedBy,
        entityType: 'COUPON',
        entityId: coupon.id,
      },
    });

    return coupon;
  }

  async remove(id: string, performedBy: string, restaurantId?: string) {
    await this.findOne(id, restaurantId);
    await this.prisma.coupon.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE_COUPON',
        performedBy,
        entityType: 'COUPON',
        entityId: id,
      },
    });

    return { message: 'Coupon deleted successfully' };
  }
}
