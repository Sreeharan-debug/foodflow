import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot be more than 5' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  comment: string;

  @IsString()
  @IsNotEmpty({ message: 'Food item ID is required' })
  foodId: string;
}

export class UpdateReviewDto {
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot be more than 5' })
  @IsOptional()
  rating?: number;

  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @IsOptional()
  comment?: string;
}
