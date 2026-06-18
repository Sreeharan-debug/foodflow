import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatusGuard } from '../../common/guards/status.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, StatusGuard)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, StatusGuard)
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(userId, id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, StatusGuard)
  async remove(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Param('id') id: string,
  ) {
    return this.reviewsService.remove(userId, role, id);
  }

  @Get('food/:foodId')
  async getByFood(@Param('foodId') foodId: string) {
    return this.reviewsService.findByFood(foodId);
  }

  @Get('food/:foodId/stats')
  async getStats(@Param('foodId') foodId: string) {
    return this.reviewsService.getStats(foodId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    return this.reviewsService.findAll();
  }
}
