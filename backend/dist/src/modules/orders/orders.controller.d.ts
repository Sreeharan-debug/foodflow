import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { Role } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(userId: string, checkoutDto: CheckoutDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        items: ({
            food: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: import("@prisma/client/runtime/library").Decimal;
                imageUrl: string;
                rating: number;
                preparationTime: number;
                featured: boolean;
                isAvailable: boolean;
                isVeg: boolean;
                isBestseller: boolean;
                isTrending: boolean;
                isNew: boolean;
                spiceLevel: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            foodId: string;
            orderId: string;
        })[];
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            label: string;
            houseNumber: string;
            buildingName: string | null;
            area: string;
            landmark: string | null;
            city: string;
            district: string;
            state: string;
            pincode: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        couponId: string | null;
        addressId: string;
    }>;
    getOrders(userId: string, role: Role): Promise<({
        items: ({
            food: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: import("@prisma/client/runtime/library").Decimal;
                imageUrl: string;
                rating: number;
                preparationTime: number;
                featured: boolean;
                isAvailable: boolean;
                isVeg: boolean;
                isBestseller: boolean;
                isTrending: boolean;
                isNew: boolean;
                spiceLevel: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            foodId: string;
            orderId: string;
        })[];
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            label: string;
            houseNumber: string;
            buildingName: string | null;
            area: string;
            landmark: string | null;
            city: string;
            district: string;
            state: string;
            pincode: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        couponId: string | null;
        addressId: string;
    })[]>;
    getOrderById(userId: string, role: Role, id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        items: ({
            food: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: import("@prisma/client/runtime/library").Decimal;
                imageUrl: string;
                rating: number;
                preparationTime: number;
                featured: boolean;
                isAvailable: boolean;
                isVeg: boolean;
                isBestseller: boolean;
                isTrending: boolean;
                isNew: boolean;
                spiceLevel: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            foodId: string;
            orderId: string;
        })[];
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            label: string;
            houseNumber: string;
            buildingName: string | null;
            area: string;
            landmark: string | null;
            city: string;
            district: string;
            state: string;
            pincode: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        couponId: string | null;
        addressId: string;
    }>;
    updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, adminEmail: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        items: ({
            food: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: import("@prisma/client/runtime/library").Decimal;
                imageUrl: string;
                rating: number;
                preparationTime: number;
                featured: boolean;
                isAvailable: boolean;
                isVeg: boolean;
                isBestseller: boolean;
                isTrending: boolean;
                isNew: boolean;
                spiceLevel: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            foodId: string;
            orderId: string;
        })[];
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            label: string;
            houseNumber: string;
            buildingName: string | null;
            area: string;
            landmark: string | null;
            city: string;
            district: string;
            state: string;
            pincode: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        discount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        couponId: string | null;
        addressId: string;
    }>;
}
