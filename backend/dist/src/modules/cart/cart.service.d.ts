import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateCart(userId: string): Promise<{
        items: ({
            food: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            cartId: string;
            foodId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addItem(userId: string, addToCartDto: AddToCartDto): Promise<{
        items: ({
            food: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            cartId: string;
            foodId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
        items: ({
            food: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            cartId: string;
            foodId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeItem(userId: string, cartItemId: string): Promise<{
        items: ({
            food: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            cartId: string;
            foodId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    clearCart(userId: string): Promise<{
        items: ({
            food: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            cartId: string;
            foodId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
