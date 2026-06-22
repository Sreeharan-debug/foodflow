import { FoodsService } from './foods.service';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class FoodsController {
    private readonly foodsService;
    private readonly cloudinaryService;
    constructor(foodsService: FoodsService, cloudinaryService: CloudinaryService);
    getFoods(search?: string, categoryId?: string, featured?: string, popular?: string, sort?: string, page?: string, limit?: string, isVeg?: string, restaurantId?: string): Promise<{
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getFoodsAdmin(adminUser: any): Promise<({
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
    })[]>;
    getFeaturedFoods(): Promise<({
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
    })[]>;
    getPopularFoods(): Promise<({
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
    })[]>;
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
    getRestaurantById(id: string): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.AdminStatus;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        logo: string | null;
        ownerId: string;
    }>;
    getFoodById(id: string): Promise<{
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
    }>;
    createFood(createFoodDto: CreateFoodDto, file: any, adminUser: any): Promise<{
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
    }>;
    updateFood(id: string, updateFoodDto: UpdateFoodDto, file: any, adminUser: any): Promise<{
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
    }>;
    deleteFood(id: string, adminUser: any): Promise<{
        message: string;
    }>;
}
