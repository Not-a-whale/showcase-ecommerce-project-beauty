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
import {
  DiscountType,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
} from '@ecommerce/shared-types';

export class CreatePromoCodeDto implements CreatePromoCodeRequest {
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

export class UpdatePromoCodeDto implements UpdatePromoCodeRequest {
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


