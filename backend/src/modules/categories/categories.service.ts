import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId?: string) {
    const where: any = {};
    if (restaurantId) {
      where.OR = [
        { restaurantId: null },
        { restaurantId },
      ];
    }
    return this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, restaurantId?: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { foods: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (restaurantId && category.restaurantId && category.restaurantId !== restaurantId) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto, performedBy: string, restaurantId?: string) {
    const existing = await this.prisma.category.findFirst({
      where: {
        name: { equals: createCategoryDto.name, mode: 'insensitive' },
        OR: [
          { restaurantId: null },
          { restaurantId },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists`);
    }

    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        restaurantId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_CATEGORY',
        performedBy,
        entityType: 'CATEGORY',
        entityId: category.id,
      },
    });

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, performedBy: string, restaurantId?: string) {
    const existingCategory = await this.findOne(id, restaurantId);
    
    if (existingCategory.restaurantId && existingCategory.restaurantId !== restaurantId) {
      throw new ConflictException('You do not have permission to edit this category');
    }

    if (updateCategoryDto.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Category with name "${updateCategoryDto.name}" already exists`);
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_CATEGORY',
        performedBy,
        entityType: 'CATEGORY',
        entityId: category.id,
      },
    });

    return category;
  }

  async remove(id: string, performedBy: string, restaurantId?: string) {
    const existingCategory = await this.findOne(id, restaurantId);
    if (existingCategory.restaurantId && existingCategory.restaurantId !== restaurantId) {
      throw new ConflictException('You do not have permission to delete this category');
    }
    await this.prisma.category.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE_CATEGORY',
        performedBy,
        entityType: 'CATEGORY',
        entityId: id,
      },
    });

    return { message: 'Category deleted successfully' };
  }
}
