"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const foods_service_1 = require("./foods.service");
const food_dto_1 = require("./dto/food.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const status_guard_1 = require("../../common/guards/status.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const client_1 = require("@prisma/client");
let FoodsController = class FoodsController {
    foodsService;
    cloudinaryService;
    constructor(foodsService, cloudinaryService) {
        this.foodsService = foodsService;
        this.cloudinaryService = cloudinaryService;
    }
    async getFoods(search, categoryId, featured, popular, sort, page, limit, isVeg, restaurantId) {
        return this.foodsService.findAll({ search, categoryId, featured, popular, sort, page, limit, isVeg, restaurantId });
    }
    async getFoodsAdmin(adminUser) {
        return this.foodsService.findAllAdmin(adminUser.restaurant?.id);
    }
    async getFeaturedFoods() {
        return this.foodsService.findFeatured();
    }
    async getPopularFoods() {
        return this.foodsService.findPopular();
    }
    async getRestaurants() {
        return this.foodsService.getRestaurants();
    }
    async getRestaurantById(id) {
        return this.foodsService.getRestaurant(id);
    }
    async getFoodById(id) {
        return this.foodsService.findOne(id);
    }
    async createFood(createFoodDto, file, adminUser) {
        let imageUrl = '';
        if (file) {
            imageUrl = await this.cloudinaryService.uploadImage(file);
        }
        return this.foodsService.create(createFoodDto, imageUrl, adminUser.email, adminUser.restaurant?.id);
    }
    async updateFood(id, updateFoodDto, file, adminUser) {
        let imageUrl = '';
        if (file) {
            imageUrl = await this.cloudinaryService.uploadImage(file);
        }
        return this.foodsService.update(id, updateFoodDto, imageUrl, adminUser.email, adminUser.restaurant?.id);
    }
    async deleteFood(id, adminUser) {
        return this.foodsService.remove(id, adminUser.email, adminUser.restaurant?.id);
    }
};
exports.FoodsController = FoodsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('featured')),
    __param(3, (0, common_1.Query)('popular')),
    __param(4, (0, common_1.Query)('sort')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('isVeg')),
    __param(8, (0, common_1.Query)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "getFoods", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, status_guard_1.StatusGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "getFoodsAdmin", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "getFeaturedFoods", null);
__decorate([
    (0, common_1.Get)('popular'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "getPopularFoods", null);
__decorate([
    (0, common_1.Get)('restaurants'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "getRestaurants", null);
__decorate([
    (0, common_1.Get)('restaurants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "getRestaurantById", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "getFoodById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, status_guard_1.StatusGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [food_dto_1.CreateFoodDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "createFood", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, status_guard_1.StatusGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, food_dto_1.UpdateFoodDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "updateFood", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, status_guard_1.StatusGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FoodsController.prototype, "deleteFood", null);
exports.FoodsController = FoodsController = __decorate([
    (0, common_1.Controller)('foods'),
    __metadata("design:paramtypes", [foods_service_1.FoodsService,
        cloudinary_service_1.CloudinaryService])
], FoodsController);
//# sourceMappingURL=foods.controller.js.map