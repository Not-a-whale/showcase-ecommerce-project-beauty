import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductsCacheService } from '../products/products-cache.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { DiscountType, OrderStatus } from '@ecommerce/shared-types';
import { PromoCode } from './entities/promo-code.entity';
import { GiftCard } from './entities/gift-card.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

interface PendingOrderItem {
  productId: string;
  quantity: number;
  priceAtOrder: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private cacheService: ProductsCacheService,
    @Inject('PAYMENT_SERVICE') private client: ClientProxy,
  ) {}

  async handlePaidOrder(orderId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) {
        return;
      }
      if (order.status !== OrderStatus.PENDING) {
        return;
      }
      order.status = OrderStatus.PAID;
      await manager.save(order);
    });
  }

  async handleFailedOrder(orderId: string): Promise<void> {
    const affectedProductIds = await this.cancelAndRestock(
      this.dataSource.manager,
      orderId,
      OrderStatus.FAILED,
    );
    await Promise.all(
      affectedProductIds.map((id) => this.cacheService.invalidate(id)),
    );
  }

  async expireStaleOrder(orderId: string): Promise<void> {
    const affectedProductIds = await this.cancelAndRestock(
      this.dataSource.manager,
      orderId,
      OrderStatus.CANCELLED,
    );
    await Promise.all(
      affectedProductIds.map((id) => this.cacheService.invalidate(id)),
    );
  }

  async cancelByUser(orderId: string, userId: string): Promise<void> {
    if (
      !(await this.dataSource.manager.findOne(Order, {
        where: { id: orderId, userId },
      }))
    ) {
      throw new NotFoundException();
    }
    await this.cancelAndRestock(
      this.dataSource.manager,
      orderId,
      OrderStatus.CANCELLED,
    );
  }

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const { order, affectedProductIds } = await this.dataSource.transaction(
      async (manager) => {
        const { items, shippingAddress } = dto;
        const pendingItems: PendingOrderItem[] = [];
        let totalAmount = 0;

        const mergedItems = new Map<string, number>();
        for (const item of items) {
          mergedItems.set(
            item.productId,
            (mergedItems.get(item.productId) ?? 0) + item.quantity,
          );
        }

        for (const [productId, quantity] of mergedItems) {
          const product = await manager.findOne(Product, {
            where: { id: productId, isDeleted: false },
          });
          if (!product) {
            throw new NotFoundException(`Product ${productId} not found`);
          }
          if (product.stock < quantity) {
            throw new BadRequestException(
              `Insufficient stock for "${product.name}" (${product.id}): requested ${quantity}, available ${product.stock}`,
            );
          }

          const expectedVersion = product.version;
          const result = await manager
            .createQueryBuilder()
            .update(Product)
            .set({
              stock: () => 'stock - :qty',
              purchaseCount: () => '"purchaseCount" + :qty',
              version: () => 'version + 1',
            })
            .where('id = :id AND version = :expectedVersion', {
              id: productId,
              expectedVersion,
            })
            .setParameter('qty', quantity)
            .execute();

          if (result.affected === 0) {
            throw new ConflictException(
              'Product was modified concurrently, please retry',
            );
          }

          const price = this.getEffectivePrice(product);
          pendingItems.push({ productId, quantity, priceAtOrder: price });
          totalAmount += quantity * price;
        }

        let promo: PromoCode | null = null;
        if (dto.promoCode) {
          promo = await manager.findOne(PromoCode, {
            where: { code: dto.promoCode },
          });
          if (!promo) {
            throw new BadRequestException('Invalid promo code');
          }
        }

        const discountAmount = this.roundToCents(
          promo ? await this.applyPromoCode(manager, promo, totalAmount) : 0,
        );

        const afterDiscount = totalAmount - discountAmount;
        const giftCardAmountUsed = dto.giftCardCode
          ? await this.applyGiftCard(manager, dto.giftCardCode, afterDiscount)
          : 0;
        const stripeChargeAmount = this.roundToCents(
          afterDiscount - giftCardAmountUsed,
        );

        const newOrder = manager.create(Order, {
          userId,
          status:
            stripeChargeAmount > 0 ? OrderStatus.PENDING : OrderStatus.PAID,
          totalAmount,
          discountAmount,
          giftCardAmountUsed,
          stripeChargeAmount,
          promoCodeUsed: promo?.code ?? null,
          giftCardCodeUsed: dto.giftCardCode ?? null,
          shippingAddress,
        });
        await manager.save(newOrder);

        const orderItems = pendingItems.map((pending) =>
          manager.create(OrderItem, {
            orderId: newOrder.id,
            productId: pending.productId,
            quantity: pending.quantity,
            priceAtOrder: pending.priceAtOrder,
          }),
        );
        await manager.save(orderItems);

        newOrder.items = orderItems;

        return {
          order: newOrder,
          affectedProductIds: Array.from(mergedItems.keys()),
        };
      },
    );

    await Promise.all(
      affectedProductIds.map((id) => this.cacheService.invalidate(id)),
    );

    if (order.stripeChargeAmount > 0) {
      await lastValueFrom(
        this.client.emit('order.created', {
          orderId: order.id,
          stripeChargeAmount: order.stripeChargeAmount,
          userId: order.userId,
        }),
      );
    }

    return plainToInstance(OrderResponseDto, order);
  }

  private async applyGiftCard(
    manager: EntityManager,
    code: string,
    amountToCover: number,
  ): Promise<number> {
    const giftCard = await manager.findOne(GiftCard, { where: { code } });

    if (!giftCard) {
      throw new BadRequestException('Invalid gift card code');
    }

    if (
      !giftCard.isActive ||
      !giftCard.expiresAt ||
      new Date(giftCard.expiresAt).getTime() < Date.now() ||
      giftCard.remainingAmount <= 0
    ) {
      throw new BadRequestException('Invalid gift card');
    }

    const giftCardAmountUsed = this.roundToCents(
      Math.min(Number(giftCard.remainingAmount), amountToCover),
    );

    const result = await manager
      .createQueryBuilder()
      .update(GiftCard)
      .set({
        remainingAmount: () => 'remainingAmount - :used',
        version: () => 'version + 1',
      })
      .where(
        'id = :id AND version = :expectedVersion AND remainingAmount >= :used',
      )
      .setParameters({
        id: giftCard.id,
        expectedVersion: giftCard.version,
        used: giftCardAmountUsed,
      })
      .execute();
    if (result.affected === 0) {
      throw new ConflictException('Gift card balance changed, please retry');
    }

    return giftCardAmountUsed;
  }

  private async applyPromoCode(
    manager: EntityManager,
    code: PromoCode,
    totalAmount: number,
  ): Promise<number> {
    const validated = await this.validateCode(code, totalAmount);

    let discountAmount: number;
    if (validated.discountType === DiscountType.PERCENTAGE) {
      discountAmount = totalAmount * (Number(validated.discountValue) / 100);
    } else {
      discountAmount = Number(validated.discountValue);
    }
    discountAmount = Math.min(discountAmount, totalAmount);

    const result = await manager
      .createQueryBuilder()
      .update(PromoCode)
      .set({
        currentUses: () => '"currentUses" + 1',
        version: () => 'version + 1',
      })
      .where(
        'id = :id AND version = :expectedVersion AND ("maxUses" IS NULL OR "currentUses" < "maxUses")',
        { id: validated.id, expectedVersion: validated.version },
      )
      .execute();

    if (result.affected === 0) {
      throw new ConflictException(
        'Promo code was just used up, please try another',
      );
    }

    return discountAmount;
  }

  private async validateCode(
    code: PromoCode | null,
    totalAmount: number = 0,
  ): Promise<PromoCode> {
    const now = Date.now();

    if (!code) {
      throw new NotFoundException('Discount code not found');
    }

    if (!code.isActive) {
      throw new BadRequestException('Discount code cannot be used');
    }

    if (
      code.startsAt &&
      code.expiresAt &&
      !(
        new Date(code.startsAt).getTime() <= now &&
        new Date(code.expiresAt).getTime() >= now
      )
    ) {
      throw new BadRequestException('Discount code expired');
    }

    if (totalAmount < Number(code.minOrderAmount)) {
      throw new BadRequestException(
        'Discount cannot be used. The minimum order amount is ' +
          code.minOrderAmount,
      );
    }

    if (code.maxUses && code.currentUses >= code.maxUses) {
      throw new BadRequestException(
        'Discount code has reached its usage limit',
      );
    }

    return code;
  }

  private getEffectivePrice(product: Product): number {
    const now = Date.now();
    if (
      product.salePrice &&
      product.saleStartsAt &&
      product.saleEndsAt &&
      new Date(product.saleStartsAt).getTime() <= now &&
      new Date(product.saleEndsAt).getTime() >= now
    ) {
      return Number(product.salePrice);
    }
    return Number(product.price);
  }

  private roundToCents(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  // should return list of product ids that were restocked
  private cancelAndRestock(
    manager: EntityManager,
    orderId: string,
    finalStatus: OrderStatus,
  ): Promise<string[]> {
    return manager.transaction(async (txManager) => {
      const order = await txManager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) {
        return [];
      }
      if (order.status !== OrderStatus.PENDING) {
        return [];
      }

      const items = await txManager.find(OrderItem, {
        where: { orderId: order.id },
      });

      for (const item of items) {
        await txManager.increment(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
        await txManager.decrement(
          Product,
          { id: item.productId },
          'purchaseCount',
          item.quantity,
        );
      }
      order.status = finalStatus;
      await txManager.save(order);

      return items.map((item) => item.productId);
    });
  }
}
