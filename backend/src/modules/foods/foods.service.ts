import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FoodsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    search?: string;
    categoryId?: string;
    featured?: string;
    popular?: string;
    sort?: string;
    page?: string;
    limit?: string;
    isVeg?: string;
    restaurantId?: string;
  }) {
    const search = query.search || '';
    const categoryId = query.categoryId;
    const featured = query.featured === 'true';
    const popular = query.popular === 'true';
    const isVeg = query.isVeg === 'true';
    const sort = query.sort || 'name_asc';
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '10', 10));
    const skip = (page - 1) * limit;

    const where: Prisma.FoodWhereInput = {
      isAvailable: true, // Only show available foods to customers
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

    if (query.restaurantId) {
      where.restaurantId = query.restaurantId;
    }

    // Sorting
    let orderBy: Prisma.FoodOrderByWithRelationInput = { name: 'asc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating_desc') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'name_desc') {
      orderBy = { name: 'desc' };
    }

    const [foods, total] = await Promise.all([
      this.prisma.food.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          _count: {
            select: { reviews: true },
          },
        },
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

  // Admin findAll that sees everything (including unavailable items)
  async findAllAdmin(restaurantId: string) {
    return this.prisma.food.findMany({
      where: { restaurantId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFeatured() {
    return this.prisma.food.findMany({
      where: { featured: true, isAvailable: true },
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findPopular() {
    return this.prisma.food.findMany({
      where: { rating: { gte: 4.7 }, isAvailable: true },
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { rating: 'desc' },
      take: 6,
    });
  }

  async findOne(id: string) {
    const food = await this.prisma.food.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!food) {
      throw new NotFoundException(`Food item with ID ${id} not found`);
    }

    return food;
  }

  async create(createFoodDto: CreateFoodDto, imageUrl: string, performedBy: string, restaurantId: string) {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createFoodDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${createFoodDto.categoryId} not found`);
    }

    const food = await this.prisma.food.create({
      data: {
        name: createFoodDto.name,
        description: createFoodDto.description,
        price: new Prisma.Decimal(createFoodDto.price),
        categoryId: createFoodDto.categoryId,
        restaurantId,
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

  async update(id: string, updateFoodDto: UpdateFoodDto, imageUrl: string, performedBy: string, restaurantId: string) {
    const existingFood = await this.findOne(id);
    if (existingFood.restaurantId !== restaurantId) {
      throw new NotFoundException(`Food item with ID ${id} not found or you do not have permission to modify it`);
    }

    if (updateFoodDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateFoodDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${updateFoodDto.categoryId} not found`);
      }
    }

    const data: Prisma.FoodUpdateInput = {};
    if (updateFoodDto.name !== undefined) data.name = updateFoodDto.name;
    if (updateFoodDto.description !== undefined) data.description = updateFoodDto.description;
    if (updateFoodDto.price !== undefined) data.price = new Prisma.Decimal(updateFoodDto.price);
    if (updateFoodDto.categoryId !== undefined) {
      data.category = { connect: { id: updateFoodDto.categoryId } };
    }
    if (imageUrl) {
      data.imageUrl = imageUrl;
    } else if (updateFoodDto.imageUrl !== undefined) {
      data.imageUrl = updateFoodDto.imageUrl;
    }
    if (updateFoodDto.rating !== undefined) data.rating = updateFoodDto.rating;
    if (updateFoodDto.preparationTime !== undefined) data.preparationTime = updateFoodDto.preparationTime;
    if (updateFoodDto.featured !== undefined) data.featured = updateFoodDto.featured;
    if (updateFoodDto.isAvailable !== undefined) data.isAvailable = updateFoodDto.isAvailable;
    if (updateFoodDto.isVeg !== undefined) data.isVeg = updateFoodDto.isVeg;
    if (updateFoodDto.isBestseller !== undefined) data.isBestseller = updateFoodDto.isBestseller;
    if (updateFoodDto.isTrending !== undefined) data.isTrending = updateFoodDto.isTrending;
    if (updateFoodDto.isNew !== undefined) data.isNew = updateFoodDto.isNew;
    if (updateFoodDto.spiceLevel !== undefined) data.spiceLevel = updateFoodDto.spiceLevel;

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

  async remove(id: string, performedBy: string, restaurantId: string) {
    const existingFood = await this.findOne(id);
    if (existingFood.restaurantId !== restaurantId) {
      throw new NotFoundException(`Food item with ID ${id} not found or you do not have permission to delete it`);
    }
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

  async getRestaurants() {
    return this.prisma.restaurant.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
    });
  }

  async getRestaurant(id: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, status: 'APPROVED' },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }
}
