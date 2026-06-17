import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty({ message: 'Food ID is required' })
  foodId: string;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsOptional()
  @Type(() => Number)
  quantity?: number = 1;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;
}
