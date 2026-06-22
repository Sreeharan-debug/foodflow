import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StatusGuard } from '../../common/guards/status.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, StatusGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async checkout(
    @CurrentUser('id') userId: string,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.ordersService.checkout(userId, checkoutDto);
  }

  @Get()
  async getOrders(
    @CurrentUser() user: any,
  ) {
    return this.ordersService.findAll(user.id, user.role, user.restaurant?.id);
  }

  @Get(':id')
  async getOrderById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(user.id, user.role, id, user.restaurant?.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() adminUser: any,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, adminUser.email, adminUser.restaurant?.id);
  }
}
