import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() price: number;
  @Expose() stock: number;
  @Expose() imageUrl: string;
  @Expose() salePrice: number;
  @Expose() categoryId: string;
  @Expose() purchaseCount: number;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
