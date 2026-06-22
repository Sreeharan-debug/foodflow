import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
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

  async addItem(userId: string, addToCartDto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const { foodId, quantity = 1 } = addToCartDto;

    const food = await this.prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food || !food.isAvailable) {
      throw new NotFoundException('Food item is not available or does not exist');
    }

    // Enforce that all items in the cart must belong to the same restaurant
    if (cart.items.length > 0) {
      const firstItem = cart.items[0];
      if (firstItem.food.restaurantId && food.restaurantId && firstItem.food.restaurantId !== food.restaurantId) {
        throw new ConflictException('All items in the cart must belong to the same restaurant');
      }
    }

    // Check if food already in cart
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
    } else {
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

  async updateItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto) {
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
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: updateCartItemDto.quantity },
    });

    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, cartItemId: string) {
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
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: item.id },
    });

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getOrCreateCart(userId);
  }
}
