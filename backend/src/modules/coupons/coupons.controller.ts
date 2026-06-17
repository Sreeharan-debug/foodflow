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
  async getCoupons() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getCouponById(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createCoupon(
    @Body() createCouponDto: CreateCouponDto,
    @CurrentUser('email') adminEmail: string,
  ) {
    return this.couponsService.create(createCouponDto, adminEmail);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateCoupon(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
    @CurrentUser('email') adminEmail: string,
  ) {
    return this.couponsService.update(id, updateCouponDto, adminEmail);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCoupon(
    @Param('id') id: string,
    @CurrentUser('email') adminEmail: string,
  ) {
    return this.couponsService.remove(id, adminEmail);
  }
}
