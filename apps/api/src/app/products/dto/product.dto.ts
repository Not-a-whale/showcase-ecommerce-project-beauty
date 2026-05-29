import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateProductRequest,
  ProductsQuery,
  UpdateProductRequest,
} from '@ecommerce/shared-types';
import type {
  SortType,
} from '@ecommerce/shared-types';

export class CreateProductDto implements CreateProductRequest {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  categoryId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  salePrice?: number;

  @IsDateString()
  @IsOptional()
  saleStartsAt?: string;

  @IsDateString()
  @IsOptional()
  saleEndsAt?: string;
}

export class UpdateProductDto implements UpdateProductRequest {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  salePrice?: number | null; // null to remove sale

  @IsDateString()
  @IsOptional()
  saleStartsAt?: string | null;

  @IsDateString()
  @IsOptional()
  saleEndsAt?: string | null;
}

export class ProductsQueryDto implements ProductsQuery {
  @IsString()
  category: string;

  @IsEnum(['price_asc', 'price_desc', 'newest', 'oldest', 'popular'] as const)
  @IsOptional()
  sort?: SortType = 'newest';

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  cursor?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}



