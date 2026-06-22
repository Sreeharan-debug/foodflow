import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(restaurantId?: string) {
    const whereOrder: any = {};
    const whereFood: any = {};
    const whereCategory: any = {};
    const whereUser: any = { role: 'CUSTOMER' };

    if (restaurantId) {
      whereOrder.restaurantId = restaurantId;
      whereFood.restaurantId = restaurantId;
      whereCategory.OR = [
        { restaurantId: null },
        { restaurantId },
      ];
      whereUser.orders = { some: { restaurantId } };
    }

    // 1. Core counters
    const [totalOrders, totalUsers, totalFoods, totalCategories] = await Promise.all([
      this.prisma.order.count({ where: whereOrder }),
      this.prisma.user.count({ where: whereUser }),
      this.prisma.food.count({ where: whereFood }),
      this.prisma.category.count({ where: whereCategory }),
    ]);

    // 2. Active users (placed at least one order)
    const activeUsersCount = await this.prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: { some: restaurantId ? { restaurantId } : {} },
      },
    });

    // 3. Revenue calculations (excluding cancelled orders)
    const revenueWhere = {
      status: { not: OrderStatus.CANCELLED },
      ...(restaurantId ? { restaurantId } : {}),
    };
    const ordersForRevenue = await this.prisma.order.findMany({
      where: revenueWhere,
      select: {
        total: true,
        createdAt: true,
      },
    });

    let totalRevenue = 0;
    let revenueToday = 0;
    let revenueThisWeek = 0;
    let revenueThisMonth = 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const order of ordersForRevenue) {
      const orderTotal = Number(order.total);
      totalRevenue += orderTotal;

      if (order.createdAt >= startOfToday) {
        revenueToday += orderTotal;
      }
      if (order.createdAt >= startOfWeek) {
        revenueThisWeek += orderTotal;
      }
      if (order.createdAt >= startOfMonth) {
        revenueThisMonth += orderTotal;
      }
    }

    // Average Order Value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 4. Revenue Trend (Group by last 7 days)
    const trendDays = 7;
    const revenueTrend = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const dayOrders = ordersForRevenue.filter(o => o.createdAt >= dayStart && o.createdAt <= dayEnd);
      const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);

      revenueTrend.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    // 5. Orders by Status
    const statusCounts = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const ordersByStatus = Object.values(OrderStatus).map((status) => {
      const found = statusCounts.find((sc) => sc.status === status);
      return {
        status,
        count: found ? found._count.id : 0,
      };
    });

    // 6. Top Selling Foods
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: OrderStatus.CANCELLED },
          ...(restaurantId ? { restaurantId } : {}),
        },
      },
      include: {
        food: { select: { name: true } },
      },
    });

    const foodSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const item of orderItems) {
      if (!foodSalesMap[item.foodId]) {
        foodSalesMap[item.foodId] = {
          name: item.food.name,
          quantity: 0,
          revenue: 0,
        };
      }
      foodSalesMap[item.foodId].quantity += item.quantity;
      foodSalesMap[item.foodId].revenue += Number(item.price) * item.quantity;
    }

    const topSellingFoods = Object.values(foodSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 7. Top Selling Categories
    const categoriesList = await this.prisma.category.findMany({
      where: whereCategory,
      include: {
        foods: {
          where: whereFood,
          select: { id: true },
        },
      },
    });

    const categorySales = categoriesList.map((cat) => {
      const foodIds = cat.foods.map((f) => f.id);
      const itemsInCat = orderItems.filter((item) => foodIds.includes(item.foodId));
      const quantity = itemsInCat.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = itemsInCat.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

      return {
        name: cat.name,
        quantity,
        revenue,
      };
    }).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    // 8. Recent Activity Feed
    const recentActivity = await this.prisma.order.findMany({
      where: whereOrder,
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const recentActivityFeed = recentActivity.map((order) => ({
      id: order.id,
      customerName: order.user.name,
      customerEmail: order.user.email,
      total: Number(order.total),
      status: order.status,
      timestamp: order.createdAt,
    }));

    return {
      kpis: {
        totalOrders,
        totalUsers,
        totalFoods,
        totalCategories,
        activeUsersCount,
        totalRevenue,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
        averageOrderValue,
        topSellingFood: topSellingFoods[0]?.name || 'N/A',
      },
      revenueTrend,
      ordersByStatus,
      topSellingFoods,
      categorySales,
      recentActivityFeed,
    };
  }
}
