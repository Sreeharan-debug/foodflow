import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(userId: string, checkoutDto: CheckoutDto): Promise<{
        order: {
            user: {
                id: string;
                email: string;
                name: string;
            };
            address: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                label: string;
                houseNumber: string;
                buildingName: string | null;
                area: string;
                landmark: string | null;
                city: string;
                district: string;
                state: string;
                pincode: string;
                userId: string;
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
                    restaurantId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                foodId: string;
                quantity: number;
                price: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            restaurantId: string | null;
            discount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            paymentStatus: string;
            couponId: string | null;
            addressId: string;
        };
        razorpayOrder: {
            id: string;
            amount: string | number;
            currency: string;
            receipt: string | undefined;
        } | null;
    }>;
    getOrders(user: any): Promise<({
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            houseNumber: string;
            buildingName: string | null;
            area: string;
            landmark: string | null;
            city: string;
            district: string;
            state: string;
            pincode: string;
            userId: string;
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
                restaurantId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            foodId: string;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        restaurantId: string | null;
        discount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        couponId: string | null;
        addressId: string;
    })[]>;
    getOrderById(user: any, id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            houseNumber: string;
            buildingName: string | null;
            area: string;
            landmark: string | null;
            city: string;
            district: string;
            state: string;
            pincode: string;
            userId: string;
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
                restaurantId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            foodId: string;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        restaurantId: string | null;
        discount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        couponId: string | null;
        addressId: string;
    }>;
    updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, adminUser: any): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            firstName: string | null;
        };
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            houseNumber: string;
            buildingName: string | null;
            area: string;
            landmark: string | null;
            city: string;
            district: string;
            state: string;
            pincode: string;
            userId: string;
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
                restaurantId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            foodId: string;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        restaurantId: string | null;
        discount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        couponId: string | null;
        addressId: string;
    }>;
}
