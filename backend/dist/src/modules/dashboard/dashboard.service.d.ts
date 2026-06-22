import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(restaurantId?: string): Promise<{
        kpis: {
            totalOrders: number;
            totalUsers: number;
            totalFoods: number;
            totalCategories: number;
            activeUsersCount: number;
            totalRevenue: number;
            revenueToday: number;
            revenueThisWeek: number;
            revenueThisMonth: number;
            averageOrderValue: number;
            topSellingFood: string;
        };
        revenueTrend: {
            date: string;
            revenue: number;
            orders: number;
        }[];
        ordersByStatus: {
            status: "PENDING" | "DELIVERED" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "CANCELLED";
            count: number;
        }[];
        topSellingFoods: {
            name: string;
            quantity: number;
            revenue: number;
        }[];
        categorySales: {
            name: string;
            quantity: number;
            revenue: number;
        }[];
        recentActivityFeed: {
            id: string;
            customerName: string;
            customerEmail: string;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            timestamp: Date;
        }[];
    }>;
}
