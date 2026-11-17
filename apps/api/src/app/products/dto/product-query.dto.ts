import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { ProductsQuery, SortType } from '@ecommerce/shared-types';

export class ProductQueryDto implements ProductsQuery {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Matches(/^[a-z0-9-]+$/)
  category?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === true)
  @IsBoolean()
  sale?: boolean;

  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'newest', 'oldest', 'popular'])
  sort?: SortType = 'newest';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
