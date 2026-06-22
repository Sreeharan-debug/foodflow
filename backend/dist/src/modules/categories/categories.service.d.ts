import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(restaurantId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        restaurantId: string | null;
    }[]>;
    findOne(id: string, restaurantId?: string): Promise<{
        foods: {
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
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        restaurantId: string | null;
    }>;
    create(createCategoryDto: CreateCategoryDto, performedBy: string, restaurantId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        restaurantId: string | null;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, performedBy: string, restaurantId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        restaurantId: string | null;
    }>;
    remove(id: string, performedBy: string, restaurantId?: string): Promise<{
        message: string;
    }>;
}
