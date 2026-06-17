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
exports.FoodsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FoodsService = class FoodsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const search = query.search || '';
        const categoryId = query.categoryId;
        const featured = query.featured === 'true';
        const popular = query.popular === 'true';
        const isVeg = query.isVeg === 'true';
        const sort = query.sort || 'name_asc';
        const page = Math.max(1, parseInt(query.page || '1', 10));
        const limit = Math.max(1, parseInt(query.limit || '10', 10));
        const skip = (page - 1) * limit;
        const where = {
            isAvailable: true,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { category: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (query.featured !== undefined && query.featured !== '') {
            where.featured = featured;
        }
        if (isVeg) {
            where.isVeg = true;
        }
        if (popular) {
            where.rating = { gte: 4.7 };
        }
        let orderBy = { name: 'asc' };
        if (sort === 'price_asc') {
            orderBy = { price: 'asc' };
        }
        else if (sort === 'price_desc') {
            orderBy = { price: 'desc' };
        }
        else if (sort === 'rating_desc') {
            orderBy = { rating: 'desc' };
        }
        else if (sort === 'name_desc') {
            orderBy = { name: 'desc' };
        }
        const [foods, total] = await Promise.all([
            this.prisma.food.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: { category: true },
            }),
            this.prisma.food.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            foods,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async findAllAdmin() {
        return this.prisma.food.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findFeatured() {
        return this.prisma.food.findMany({
            where: { featured: true, isAvailable: true },
            include: { category: true },
            orderBy: { rating: 'desc' },
        });
    }
    async findPopular() {
        return this.prisma.food.findMany({
            where: { rating: { gte: 4.7 }, isAvailable: true },
            include: { category: true },
            orderBy: { rating: 'desc' },
            take: 6,
        });
    }
    async findOne(id) {
        const food = await this.prisma.food.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!food) {
            throw new common_1.NotFoundException(`Food item with ID ${id} not found`);
        }
        return food;
    }
    async create(createFoodDto, imageUrl, performedBy) {
        const category = await this.prisma.category.findUnique({
            where: { id: createFoodDto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${createFoodDto.categoryId} not found`);
        }
        const food = await this.prisma.food.create({
            data: {
                name: createFoodDto.name,
                description: createFoodDto.description,
                price: new client_1.Prisma.Decimal(createFoodDto.price),
                categoryId: createFoodDto.categoryId,
                imageUrl: imageUrl || createFoodDto.imageUrl || '',
                rating: createFoodDto.rating !== undefined ? createFoodDto.rating : 5.0,
                preparationTime: createFoodDto.preparationTime,
                featured: createFoodDto.featured || false,
                isAvailable: createFoodDto.isAvailable !== undefined ? createFoodDto.isAvailable : true,
                isVeg: createFoodDto.isVeg || false,
                isBestseller: createFoodDto.isBestseller || false,
                isTrending: createFoodDto.isTrending || false,
                isNew: createFoodDto.isNew || false,
                spiceLevel: createFoodDto.spiceLevel || 'Medium',
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'CREATE_FOOD',
                performedBy,
                entityType: 'FOOD',
                entityId: food.id,
            },
        });
        return food;
    }
    async update(id, updateFoodDto, imageUrl, performedBy) {
        await this.findOne(id);
        if (updateFoodDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: updateFoodDto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Category with ID ${updateFoodDto.categoryId} not found`);
            }
        }
        const data = {};
        if (updateFoodDto.name !== undefined)
            data.name = updateFoodDto.name;
        if (updateFoodDto.description !== undefined)
            data.description = updateFoodDto.description;
        if (updateFoodDto.price !== undefined)
            data.price = new client_1.Prisma.Decimal(updateFoodDto.price);
        if (updateFoodDto.categoryId !== undefined) {
            data.category = { connect: { id: updateFoodDto.categoryId } };
        }
        if (imageUrl) {
            data.imageUrl = imageUrl;
        }
        else if (updateFoodDto.imageUrl !== undefined) {
            data.imageUrl = updateFoodDto.imageUrl;
        }
        if (updateFoodDto.rating !== undefined)
            data.rating = updateFoodDto.rating;
        if (updateFoodDto.preparationTime !== undefined)
            data.preparationTime = updateFoodDto.preparationTime;
        if (updateFoodDto.featured !== undefined)
            data.featured = updateFoodDto.featured;
        if (updateFoodDto.isAvailable !== undefined)
            data.isAvailable = updateFoodDto.isAvailable;
        if (updateFoodDto.isVeg !== undefined)
            data.isVeg = updateFoodDto.isVeg;
        if (updateFoodDto.isBestseller !== undefined)
            data.isBestseller = updateFoodDto.isBestseller;
        if (updateFoodDto.isTrending !== undefined)
            data.isTrending = updateFoodDto.isTrending;
        if (updateFoodDto.isNew !== undefined)
            data.isNew = updateFoodDto.isNew;
        if (updateFoodDto.spiceLevel !== undefined)
            data.spiceLevel = updateFoodDto.spiceLevel;
        const food = await this.prisma.food.update({
            where: { id },
            data,
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'UPDATE_FOOD',
                performedBy,
                entityType: 'FOOD',
                entityId: food.id,
            },
        });
        return food;
    }
    async remove(id, performedBy) {
        await this.findOne(id);
        await this.prisma.food.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: {
                action: 'DELETE_FOOD',
                performedBy,
                entityType: 'FOOD',
                entityId: id,
            },
        });
        return { message: 'Food item deleted successfully' };
    }
};
exports.FoodsService = FoodsService;
exports.FoodsService = FoodsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FoodsService);
//# sourceMappingURL=foods.service.js.map