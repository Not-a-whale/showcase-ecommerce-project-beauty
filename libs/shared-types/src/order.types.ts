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

export interface CreatePromoCodeRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  startsAt: string;
  expiresAt: string;
}

export interface UpdatePromoCodeRequest {
  isActive?: boolean;
  maxUses?: number;
  expiresAt?: string;
}

export enum GiftCardDenomination {
  TWENTY_FIVE = 25,
  FIFTY = 50,
  HUNDRED = 100,
}

export interface PurchaseGiftCardRequest {
  amount: GiftCardDenomination;
  expiresAt?: string;
}

// Promo codes
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

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

export interface StripeOrder {
  orderId: string;
  stripeChargeAmount: number;
  userId: string;
}
