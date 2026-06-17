import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FoodsService } from './foods.service';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StatusGuard } from '../../common/guards/status.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '@prisma/client';

@Controller('foods')
export class FoodsController {
  constructor(
    private readonly foodsService: FoodsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getFoods(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('featured') featured?: string,
    @Query('popular') popular?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isVeg') isVeg?: string,
  ) {
    return this.foodsService.findAll({ search, categoryId, featured, popular, sort, page, limit, isVeg });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getFoodsAdmin() {
    return this.foodsService.findAllAdmin();
  }

  @Get('featured')
  async getFeaturedFoods() {
    return this.foodsService.findFeatured();
  }

  @Get('popular')
  async getPopularFoods() {
    return this.foodsService.findPopular();
  }

  @Get(':id')
  async getFoodById(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async createFood(
    @Body() createFoodDto: CreateFoodDto,
    @UploadedFile() file: any,
    @CurrentUser('email') adminEmail: string,
  ) {
    let imageUrl = '';
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file);
    }
    return this.foodsService.create(createFoodDto, imageUrl, adminEmail);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async updateFood(
    @Param('id') id: string,
    @Body() updateFoodDto: UpdateFoodDto,
    @UploadedFile() file: any,
    @CurrentUser('email') adminEmail: string,
  ) {
    let imageUrl = '';
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file);
    }
    return this.foodsService.update(id, updateFoodDto, imageUrl, adminEmail);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteFood(
    @Param('id') id: string,
    @CurrentUser('email') adminEmail: string,
  ) {
    return this.foodsService.remove(id, adminEmail);
  }
}
