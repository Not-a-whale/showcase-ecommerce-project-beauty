import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import {
  GiftCardDenomination,
  PurchaseGiftCardRequest,
} from '@ecommerce/shared-types';

export class PurchaseGiftCardDto implements PurchaseGiftCardRequest {
  @IsEnum(GiftCardDenomination)
  amount: GiftCardDenomination;

  @IsDateString()
  @IsOptional()
  expiresAt?: string; // defaults to 1 year from now
}

export class RedeemGiftCardDto {
  // gift card code comes from CreateOrderDto.giftCardCode
  // no extra DTO needed - validation happens in OrdersService
}



