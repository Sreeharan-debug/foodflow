"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CouponsService = class CouponsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(restaurantId) {
        const where = {};
        if (restaurantId) {
            where.restaurantId = restaurantId;
        }
        return this.prisma.coupon.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, restaurantId) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon with ID ${id} not found`);
        }
        if (restaurantId && coupon.restaurantId !== restaurantId) {
            throw new common_1.NotFoundException(`Coupon with ID ${id} not found`);
        }
        return coupon;
    }
    async findByCode(code, restaurantId) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon code "${code}" not found`);
        }
        if (!coupon.isActive) {
            throw new common_1.BadRequestException('This coupon is no longer active');
        }
        if (new Date() > coupon.expiresAt) {
            throw new common_1.BadRequestException('This coupon has expired');
        }
        if (restaurantId && coupon.restaurantId && coupon.restaurantId !== restaurantId) {
            throw new common_1.BadRequestException('This coupon is not valid for this restaurant');
        }
        return coupon;
    }
    async create(createCouponDto, performedBy, restaurantId) {
        const code = createCouponDto.code.toUpperCase();
        const existing = await this.prisma.coupon.findUnique({
            where: { code },
        });
        if (existing) {
            throw new common_1.ConflictException(`Coupon with code "${code}" already exists`);
        }
        const coupon = await this.prisma.coupon.create({
            data: {
                code,
                discount: new client_1.Prisma.Decimal(createCouponDto.discount),
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
    async update(id, updateCouponDto, performedBy, restaurantId) {
        const existingCoupon = await this.findOne(id, restaurantId);
        const data = {};
        if (updateCouponDto.code !== undefined) {
            const code = updateCouponDto.code.toUpperCase();
            if (code !== existingCoupon.code) {
                const duplicate = await this.prisma.coupon.findUnique({ where: { code } });
                if (duplicate) {
                    throw new common_1.ConflictException(`Coupon with code "${code}" already exists`);
                }
            }
            data.code = code;
        }
        if (updateCouponDto.discount !== undefined) {
            data.discount = new client_1.Prisma.Decimal(updateCouponDto.discount);
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
    async remove(id, performedBy, restaurantId) {
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
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map