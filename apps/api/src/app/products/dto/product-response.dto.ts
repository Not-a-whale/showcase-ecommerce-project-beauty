import { Expose, Transform, type TransformFnParams } from 'class-transformer';

const toNumber = ({ value }: TransformFnParams): number | null =>
  value === null || value === undefined ? null : Number(value);

export class ProductResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description: string | null;
  @Expose() @Transform(toNumber) price: number;
  @Expose() @Transform(toNumber) salePrice: number | null;
  @Expose() saleStartsAt: Date | null;
  @Expose() saleEndsAt: Date | null;
  @Expose() stock: number;
  @Expose() imageUrl: string | null;
  @Expose() images: string[];
  @Expose() categoryId: string;
  @Expose() purchaseCount: number;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  get effectivePrice(): number {
    if (this.salePrice === null || this.salePrice === undefined) return this.price;
    const now = Date.now();
    const started = !this.saleStartsAt || new Date(this.saleStartsAt).getTime() <= now;
    const notEnded = !this.saleEndsAt || new Date(this.saleEndsAt).getTime() >= now;
    return started && notEnded ? this.salePrice : this.price;
  }
}
