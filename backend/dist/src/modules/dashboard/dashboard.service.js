"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(restaurantId) {
        const whereOrder = {};
        const whereFood = {};
        const whereCategory = {};
        const whereUser = { role: 'CUSTOMER' };
        if (restaurantId) {
            whereOrder.restaurantId = restaurantId;
            whereFood.restaurantId = restaurantId;
            whereCategory.OR = [
                { restaurantId: null },
                { restaurantId },
            ];
            whereUser.orders = { some: { restaurantId } };
        }
        const [totalOrders, totalUsers, totalFoods, totalCategories] = await Promise.all([
            this.prisma.order.count({ where: whereOrder }),
            this.prisma.user.count({ where: whereUser }),
            this.prisma.food.count({ where: whereFood }),
            this.prisma.category.count({ where: whereCategory }),
        ]);
        const activeUsersCount = await this.prisma.user.count({
            where: {
                role: 'CUSTOMER',
                orders: { some: restaurantId ? { restaurantId } : {} },
            },
        });
        const revenueWhere = {
            status: { not: client_1.OrderStatus.CANCELLED },
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
        startOfWeek.setDate(now.getDate() - now.getDay());
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
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
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
        const statusCounts = await this.prisma.order.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        const ordersByStatus = Object.values(client_1.OrderStatus).map((status) => {
            const found = statusCounts.find((sc) => sc.status === status);
            return {
                status,
                count: found ? found._count.id : 0,
            };
        });
        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    status: { not: client_1.OrderStatus.CANCELLED },
                    ...(restaurantId ? { restaurantId } : {}),
                },
            },
            include: {
                food: { select: { name: true } },
            },
        });
        const foodSalesMap = {};
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map