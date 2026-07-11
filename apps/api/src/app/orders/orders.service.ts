import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DataSource, OptimisticLockVersionMismatchError } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderStatus } from '@ecommerce/shared-types';

interface PendingOrderItem {
  productId: string;
  quantity: number;
  priceAtOrder: number;
}

@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
        const product = await queryRunner.manager.findOne(Product, {
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

        console.log('BEFORE', product.id, 'stock=', product.stock);
        product.stock -= quantity;
        console.log('AFTER minus', product.stock);
        await queryRunner.manager.save(product);

        const price = Number(product.price);
        pendingItems.push({ productId, quantity, priceAtOrder: price });
        totalAmount += quantity * price;
      }

      const discountAmount = 0;
      const giftCardAmountUsed = 0;
      const stripeChargeAmount =
        totalAmount - discountAmount - giftCardAmountUsed;

      const order = queryRunner.manager.create(Order, {
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        discountAmount,
        giftCardAmountUsed,
        stripeChargeAmount,
        shippingAddress,
      });
      await queryRunner.manager.save(order);

      const orderItems = pendingItems.map((pending) =>
        queryRunner.manager.create(OrderItem, {
          orderId: order.id,
          productId: pending.productId,
          quantity: pending.quantity,
          priceAtOrder: pending.priceAtOrder,
        }),
      );
      await queryRunner.manager.save(orderItems);

      order.items = orderItems;
      await queryRunner.commitTransaction();
      return plainToInstance(OrderResponseDto, order);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException(
          'Product was modified by another order, please retry',
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
