import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { Prisma, Role } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PaymentsService } from '../payments/payments.service';
import { InvoiceService } from '../payments/invoice.service';
export declare class OrdersService {
    private prisma;
    private wsGateway;
    private emailService;
    private paymentsService;
    private invoiceService;
    constructor(prisma: PrismaService, wsGateway: WebsocketGateway, emailService: EmailService, paymentsService: PaymentsService, invoiceService: InvoiceService);
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
                    price: Prisma.Decimal;
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
                price: Prisma.Decimal;
                orderId: string;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            restaurantId: string | null;
            discount: Prisma.Decimal;
            total: Prisma.Decimal;
            tax: Prisma.Decimal;
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
    findAll(userId: string, role: Role, restaurantId?: string): Promise<({
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
                price: Prisma.Decimal;
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
            price: Prisma.Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        restaurantId: string | null;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        tax: Prisma.Decimal;
        paymentStatus: string;
        couponId: string | null;
        addressId: string;
    })[]>;
    findOne(userId: string, role: Role, orderId: string, restaurantId?: string): Promise<{
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
                price: Prisma.Decimal;
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
            price: Prisma.Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        restaurantId: string | null;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        tax: Prisma.Decimal;
        paymentStatus: string;
        couponId: string | null;
        addressId: string;
    }>;
    updateStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto, performedBy: string, restaurantId?: string): Promise<{
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
                price: Prisma.Decimal;
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
            price: Prisma.Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        restaurantId: string | null;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        tax: Prisma.Decimal;
        paymentStatus: string;
        couponId: string | null;
        addressId: string;
    }>;
}
