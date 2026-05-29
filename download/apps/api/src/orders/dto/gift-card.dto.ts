import { IsNumber, IsOptional, IsDateString, Min, IsEnum } from 'class-validator';

export enum GiftCardDenomination {
  TWENTY_FIVE = 25,
  FIFTY = 50,
  HUNDRED = 100,
}

export class PurchaseGiftCardDto {
  @IsEnum(GiftCardDenomination)
  amount: GiftCardDenomination;

  @IsDateString()
  @IsOptional()
  expiresAt?: string; // defaults to 1 year from now
}

export class RedeemGiftCardDto {
  // gift card code comes from CreateOrderDto.giftCardCode
  // no extra DTO needed — validation happens in OrdersService
}
