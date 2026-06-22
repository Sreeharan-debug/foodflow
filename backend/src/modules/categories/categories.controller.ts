import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StatusGuard } from '../../common/guards/status.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(@Query('restaurantId') restaurantId?: string) {
    return this.categoriesService.findAll(restaurantId);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() adminUser: any,
  ) {
    return this.categoriesService.create(createCategoryDto, adminUser.email, adminUser.restaurant?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() adminUser: any,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, adminUser.email, adminUser.restaurant?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser() adminUser: any,
  ) {
    return this.categoriesService.remove(id, adminUser.email, adminUser.restaurant?.id);
  }
}
