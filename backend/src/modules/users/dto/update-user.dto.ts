import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  role?: Role;

  @IsEnum(UserStatus, { message: 'Invalid status' })
  @IsOptional()
  status?: UserStatus;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;
}
