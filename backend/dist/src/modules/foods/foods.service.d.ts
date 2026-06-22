import { PrismaService } from '../../prisma/prisma.service';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';
import { Prisma } from '@prisma/client';
export declare class FoodsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        search?: string;
        categoryId?: string;
        featured?: string;
        popular?: string;
        sort?: string;
        page?: string;
        limit?: string;
        isVeg?: string;
        restaurantId?: string;
    }): Promise<{
        foods: ({
            _count: {
                reviews: number;
            };
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                restaurantId: string | null;
            };
        } & {
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAllAdmin(restaurantId: string): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            restaurantId: string | null;
        };
    } & {
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
    })[]>;
    findFeatured(): Promise<({
        _count: {
            reviews: number;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            restaurantId: string | null;
        };
    } & {
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
    })[]>;
    findPopular(): Promise<({
        _count: {
            reviews: number;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            restaurantId: string | null;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            reviews: number;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            restaurantId: string | null;
        };
    } & {
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
    }>;
    create(createFoodDto: CreateFoodDto, imageUrl: string, performedBy: string, restaurantId: string): Promise<{
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
    }>;
    update(id: string, updateFoodDto: UpdateFoodDto, imageUrl: string, performedBy: string, restaurantId: string): Promise<{
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
    }>;
    remove(id: string, performedBy: string, restaurantId: string): Promise<{
        message: string;
    }>;
    getRestaurants(): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.AdminStatus;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        logo: string | null;
        ownerId: string;
    }[]>;
    getRestaurant(id: string): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.AdminStatus;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        logo: string | null;
        ownerId: string;
    }>;
}
