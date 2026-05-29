export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  giftCardAmountUsed: number;
  stripeChargeAmount: number;
  promoCodeUsed: string | null;
  giftCardCodeUsed: string | null;
  shippingAddress: ShippingAddress;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtOrder: number;
  product?: {
    name: string;
    imageUrl: string | null;
  };
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  promoCode?: string;
  giftCardCode?: string;
}

// Promo codes
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  currentUses: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Gift cards
export interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  remainingAmount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}
