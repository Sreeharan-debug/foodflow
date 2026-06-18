import { FoodsService } from './foods.service';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class FoodsController {
    private readonly foodsService;
    private readonly cloudinaryService;
    constructor(foodsService: FoodsService, cloudinaryService: CloudinaryService);
    getFoods(search?: string, categoryId?: string, featured?: string, popular?: string, sort?: string, page?: string, limit?: string, isVeg?: string): Promise<{
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getFoodsAdmin(): Promise<({
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
    })[]>;
    getFeaturedFoods(): Promise<({
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
    })[]>;
    getPopularFoods(): Promise<({
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
    })[]>;
    getFoodById(id: string): Promise<{
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
    }>;
    createFood(createFoodDto: CreateFoodDto, file: any, adminEmail: string): Promise<{
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
    }>;
    updateFood(id: string, updateFoodDto: UpdateFoodDto, file: any, adminEmail: string): Promise<{
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
    }>;
    deleteFood(id: string, adminEmail: string): Promise<{
        message: string;
    }>;
}
