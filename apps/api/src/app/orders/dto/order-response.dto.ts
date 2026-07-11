import { Expose, Type } from 'class-transformer';
import { OrderStatus } from '@ecommerce/shared-types';

export class ShippingAddressResponseDto {
  @Expose()
  street: string;

  @Expose()
  city: string;

  @Expose()
  state: string;

  @Expose()
  zipCode: string;

  @Expose()
  country: string;
}

export class OrderItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderId: string;

  @Expose()
  productId: string;

  @Expose()
  quantity: number;

  @Expose()
  priceAtOrder: number;
}

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  status: OrderStatus;

  @Expose()
  totalAmount: number;

  @Expose()
  discountAmount: number;

  @Expose()
  giftCardAmountUsed: number;

  @Expose()
  stripeChargeAmount: number;

  @Expose()
  promoCodeUsed: string | null;

  @Expose()
  giftCardCodeUsed: string | null;

  @Expose()
  @Type(() => ShippingAddressResponseDto)
  shippingAddress: ShippingAddressResponseDto;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
