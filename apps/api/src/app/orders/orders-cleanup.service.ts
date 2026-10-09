import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order } from './entities/order.entity';
import { OrderStatus } from '@ecommerce/shared-types';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersCleanupService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ordersService: OrdersService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async expireStaleOrders() {
    try {
      const staleIds = await this.dataSource
        .getRepository(Order)
        .createQueryBuilder('o')
        .select('o.id', 'id')
        .where('o.status = :status', { status: OrderStatus.PENDING })
        .andWhere("o.createdAt < now() - interval '30 minutes'")
        .getRawMany<{ id: string }>();

      for (const { id } of staleIds) {
        try {
          await this.ordersService.expireStaleOrder(id);
        } catch (error) {
          console.error(`Failed to expire order ${id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in OrdersCleanupService:', error);
    }
  }
}
