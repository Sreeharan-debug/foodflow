import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StatusGuard } from '../../common/guards/status.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('coupons')
@UseGuards(JwtAuthGuard, StatusGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('validate/:code')
  async validateCoupon(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getCoupons(@CurrentUser() adminUser: any) {
    return this.couponsService.findAll(adminUser.restaurant?.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getCouponById(@Param('id') id: string, @CurrentUser() adminUser: any) {
    return this.couponsService.findOne(id, adminUser.restaurant?.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createCoupon(
    @Body() createCouponDto: CreateCouponDto,
    @CurrentUser() adminUser: any,
  ) {
    return this.couponsService.create(createCouponDto, adminUser.email, adminUser.restaurant?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateCoupon(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
    @CurrentUser() adminUser: any,
  ) {
    return this.couponsService.update(id, updateCouponDto, adminUser.email, adminUser.restaurant?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCoupon(
    @Param('id') id: string,
    @CurrentUser() adminUser: any,
  ) {
    return this.couponsService.remove(id, adminUser.email, adminUser.restaurant?.id);
  }
}
