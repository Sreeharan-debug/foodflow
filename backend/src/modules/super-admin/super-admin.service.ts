import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminStatus, UserStatus, OrderStatus, Role } from '@prisma/client';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformMetrics() {
    const [
      totalRestaurants,
      totalVendors,
      totalCustomers,
      totalOrders,
      activeVendors,
      pendingVendors,
    ] = await Promise.all([
      this.prisma.restaurant.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.count(),
      this.prisma.restaurant.count({ where: { status: AdminStatus.APPROVED } }),
      this.prisma.restaurant.count({ where: { status: AdminStatus.PENDING } }),
    ]);

    // Total Platform Revenue
    const paidOrders = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID', status: { not: OrderStatus.CANCELLED } },
      select: { total: true, createdAt: true },
    });

    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);

    // Group revenue by date for platform growth charts (last 30 days)
    const now = new Date();
    const growthTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const dayOrders = paidOrders.filter(o => o.createdAt >= dayStart && o.createdAt <= dayEnd);
      const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);

      growthTrend.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    // Top Restaurants by Revenue
    const restaurantSales = await this.prisma.order.groupBy({
      by: ['restaurantId'],
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
      _count: { id: true },
    });

    const restaurantsInfo = await this.prisma.restaurant.findMany({
      select: { id: true, name: true, logo: true },
    });

    const topRestaurants = restaurantSales.map(sales => {
      const info = restaurantsInfo.find(r => r.id === sales.restaurantId);
      return {
        id: sales.restaurantId,
        name: info?.name || 'Unknown Restaurant',
        logo: info?.logo || '',
        revenue: Number(sales._sum.total || 0),
        orders: sales._count.id,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Customer growth (users registered per day, last 7 days)
    const recentCustomers = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { createdAt: true },
    });
    const customerGrowthTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const count = recentCustomers.filter(c => c.createdAt >= dayStart && c.createdAt <= dayEnd).length;
      customerGrowthTrend.push({ day: dateStr, count });
    }

    return {
      kpis: {
        totalRevenue,
        totalRestaurants,
        totalVendors,
        totalCustomers,
        totalOrders,
        activeVendors,
        pendingVendors,
      },
      growthTrend,
      topRestaurants,
      customerGrowthTrend,
    };
  }

  async getVendors() {
    return this.prisma.restaurant.findMany({
      include: {
        owner: {
          select: { id: true, email: true, name: true, status: true },
        },
        _count: {
          select: { foods: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomers() {
    const customers = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map(c => ({
      id: c.id,
      email: c.email,
      name: c.name,
      status: c.status,
      createdAt: c.createdAt,
      ordersCount: c._count.orders,
    }));
  }

  async updateVendorStatus(restaurantId: string, status: AdminStatus) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { owner: true },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const updatedRestaurant = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { status },
      include: { owner: true },
    });

    // If vendor is suspended or rejected, we can optionally block the user account
    if (status === AdminStatus.SUSPENDED) {
      await this.prisma.user.update({
        where: { id: restaurant.ownerId },
        data: { status: UserStatus.BLOCKED },
      });
    } else if (status === AdminStatus.APPROVED) {
      await this.prisma.user.update({
        where: { id: restaurant.ownerId },
        data: { status: UserStatus.ACTIVE },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        action: `SUPER_ADMIN_UPDATE_VENDOR_STATUS_${status}`,
        performedBy: 'super-admin@foodflow.com',
        entityType: 'RESTAURANT',
        entityId: restaurantId,
      },
    });

    return updatedRestaurant;
  }

  async updateCustomerStatus(customerId: string, status: UserStatus) {
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (customer.role !== Role.CUSTOMER) {
      throw new BadRequestException('Can only modify statuses of customer accounts');
    }

    const updatedCustomer = await this.prisma.user.update({
      where: { id: customerId },
      data: { status },
      select: { id: true, email: true, name: true, status: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: `SUPER_ADMIN_UPDATE_CUSTOMER_STATUS_${status}`,
        performedBy: 'super-admin@foodflow.com',
        entityType: 'USER',
        entityId: customerId,
      },
    });

    return updatedCustomer;
  }

  async getPlatformOrders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        address: true,
        restaurant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlatformPayments() {
    return this.prisma.payment.findMany({
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true } },
            restaurant: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
