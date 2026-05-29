import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { DiscountType } from '../entities/promo-code.entity';

export class CreatePromoCodeDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  discountValue: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  minOrderAmount?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxUses?: number;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  expiresAt: string;
}

export class UpdatePromoCodeDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxUses?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
