import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(userId: string): Promise<{
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
    addItemToCart(userId: string, addToCartDto: AddToCartDto): Promise<{
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
    updateCartItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
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
    removeCartItem(userId: string, cartItemId: string): Promise<{
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
    clearMyCart(userId: string): Promise<{
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
