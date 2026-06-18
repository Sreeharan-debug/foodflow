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
    }): Promise<{
        foods: ({
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
            _count: {
                reviews: number;
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAllAdmin(): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
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
    })[]>;
    findFeatured(): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        _count: {
            reviews: number;
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
    })[]>;
    findPopular(): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        _count: {
            reviews: number;
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
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        _count: {
            reviews: number;
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
    }>;
    create(createFoodDto: CreateFoodDto, imageUrl: string, performedBy: string): Promise<{
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
    }>;
    update(id: string, updateFoodDto: UpdateFoodDto, imageUrl: string, performedBy: string): Promise<{
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
    }>;
    remove(id: string, performedBy: string): Promise<{
        message: string;
    }>;
}
