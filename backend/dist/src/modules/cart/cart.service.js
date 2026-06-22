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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateCart(userId) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { food: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: { food: true },
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });
        }
        return cart;
    }
    async addItem(userId, addToCartDto) {
        const cart = await this.getOrCreateCart(userId);
        const { foodId, quantity = 1 } = addToCartDto;
        const food = await this.prisma.food.findUnique({
            where: { id: foodId },
        });
        if (!food || !food.isAvailable) {
            throw new common_1.NotFoundException('Food item is not available or does not exist');
        }
        if (cart.items.length > 0) {
            const firstItem = cart.items[0];
            if (firstItem.food.restaurantId && food.restaurantId && firstItem.food.restaurantId !== food.restaurantId) {
                throw new common_1.ConflictException('All items in the cart must belong to the same restaurant');
            }
        }
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_foodId: {
                    cartId: cart.id,
                    foodId,
                },
            },
        });
        if (existingItem) {
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    foodId,
                    quantity,
                },
            });
        }
        return this.getOrCreateCart(userId);
    }
    async updateItem(userId, cartItemId, updateCartItemDto) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                OR: [
                    { id: cartItemId },
                    { foodId: cartItemId },
                ],
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: updateCartItemDto.quantity },
        });
        return this.getOrCreateCart(userId);
    }
    async removeItem(userId, cartItemId) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                OR: [
                    { id: cartItemId },
                    { foodId: cartItemId },
                ],
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.cartItem.delete({
            where: { id: item.id },
        });
        return this.getOrCreateCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return this.getOrCreateCart(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map