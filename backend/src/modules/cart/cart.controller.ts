import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatusGuard } from '../../common/guards/status.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard, StatusGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('items')
  async addItemToCart(
    @CurrentUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, addToCartDto);
  }

  @Patch('items/:id')
  async updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, cartItemId, updateCartItemDto);
  }

  @Delete('items/:id')
  async removeCartItem(
    @CurrentUser('id') userId: string,
    @Param('id') cartItemId: string,
  ) {
    return this.cartService.removeItem(userId, cartItemId);
  }

  @Delete()
  async clearMyCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
