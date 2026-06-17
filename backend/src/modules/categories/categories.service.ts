import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { foods: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto, performedBy: string) {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists`);
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
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

  async update(id: string, updateCategoryDto: UpdateCategoryDto, performedBy: string) {
    await this.findOne(id);

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

  async remove(id: string, performedBy: string) {
    await this.findOne(id);
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
