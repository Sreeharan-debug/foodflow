export declare class CreateFoodDto {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    rating?: number;
    preparationTime: number;
    featured?: boolean;
    isAvailable?: boolean;
    isVeg?: boolean;
    isBestseller?: boolean;
    isTrending?: boolean;
    isNew?: boolean;
    spiceLevel?: string;
}
export declare class UpdateFoodDto {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    imageUrl?: string;
    rating?: number;
    preparationTime?: number;
    featured?: boolean;
    isAvailable?: boolean;
    isVeg?: boolean;
    isBestseller?: boolean;
    isTrending?: boolean;
    isNew?: boolean;
    spiceLevel?: string;
}
