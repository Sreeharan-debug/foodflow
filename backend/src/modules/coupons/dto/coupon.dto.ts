import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty({ message: 'Coupon code is required' })
  code: string;

  @IsNumber({}, { message: 'Discount must be a valid number' })
  @Min(0, { message: 'Discount must be a positive value' })
  @Type(() => Number)
  discount: number;

  @IsDateString({}, { message: 'Please provide a valid expiration date' })
  expiresAt: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber({}, { message: 'Discount must be a valid number' })
  @Min(0, { message: 'Discount must be a positive value' })
  @IsOptional()
  @Type(() => Number)
  discount?: number;

  @IsDateString({}, { message: 'Please provide a valid expiration date' })
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
