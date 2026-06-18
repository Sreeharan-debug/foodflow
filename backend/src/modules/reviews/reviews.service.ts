import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { foodId, rating, comment } = createReviewDto;

    // 1. Verify food exists
    const food = await this.prisma.food.findUnique({
      where: { id: foodId },
    });
    if (!food) {
      throw new NotFoundException(`Food with ID ${foodId} not found`);
    }

    // 2. Check if user already reviewed this food item
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_foodId: {
          userId,
          foodId,
        },
      },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this food item. You can edit your existing review instead.');
    }

    // 3. Create review
    const review = await this.prisma.review.create({
      data: {
        userId,
        foodId,
        rating,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    });

    // 4. Recalculate average rating for this food item
    await this.recalculateFoodRating(foodId);

    // 5. Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_REVIEW',
        performedBy: userId,
        entityType: 'REVIEW',
        entityId: review.id,
      },
    });

    return review;
  }

  async update(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Only owner can update
    if (review.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this review');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    });

    // Recalculate rating
    await this.recalculateFoodRating(review.foodId);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_REVIEW',
        performedBy: userId,
        entityType: 'REVIEW',
        entityId: reviewId,
      },
    });

    return updatedReview;
  }

  async remove(userId: string, userRole: Role, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // User must be owner OR Admin
    if (userRole !== Role.ADMIN && review.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate rating
    await this.recalculateFoodRating(review.foodId);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE_REVIEW',
        performedBy: userId,
        entityType: 'REVIEW',
        entityId: reviewId,
      },
    });

    return { message: 'Review deleted successfully' };
  }

  async findByFood(foodId: string) {
    return this.prisma.review.findMany({
      where: { foodId },
      include: {
        user: {
          select: { id: true, name: true, firstName: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(foodId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { foodId },
      select: { rating: true },
    });

    const total = reviews.length;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[r.rating as 5 | 4 | 3 | 2 | 1]++;
      }
    });

    const average = total > 0 ? Number((sum / total).toFixed(1)) : 5.0;

    return {
      total,
      average,
      breakdown,
    };
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        food: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async recalculateFoodRating(foodId: string) {
    const aggregations = await this.prisma.review.aggregate({
      where: { foodId },
      _avg: {
        rating: true,
      },
    });

    const avgRating = aggregations._avg.rating ? Number(aggregations._avg.rating.toFixed(1)) : 5.0;

    await this.prisma.food.update({
      where: { id: foodId },
      data: {
        rating: avgRating,
      },
    });
  }
}
