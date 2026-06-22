import { Controller, Get, Patch, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StatusGuard } from '../../common/guards/status.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, AdminStatus, UserStatus } from '@prisma/client';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, StatusGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('metrics')
  async getPlatformMetrics() {
    return this.superAdminService.getPlatformMetrics();
  }

  @Get('vendors')
  async getVendors() {
    return this.superAdminService.getVendors();
  }

  @Get('customers')
  async getCustomers() {
    return this.superAdminService.getCustomers();
  }

  @Get('orders')
  async getPlatformOrders() {
    return this.superAdminService.getPlatformOrders();
  }

  @Get('payments')
  async getPlatformPayments() {
    return this.superAdminService.getPlatformPayments();
  }

  @Patch('vendors/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateVendorStatus(
    @Param('id') restaurantId: string,
    @Body('status') status: AdminStatus,
  ) {
    return this.superAdminService.updateVendorStatus(restaurantId, status);
  }

  @Patch('customers/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateCustomerStatus(
    @Param('id') customerId: string,
    @Body('status') status: UserStatus,
  ) {
    return this.superAdminService.updateCustomerStatus(customerId, status);
  }
}
