import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersCleanupService } from './orders-cleanup.service';

@Module({
  imports: [
    ProductsModule,
    ClientsModule.register([
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://ecommerce:ecommerce_pass@localhost:5672',
          ],
          queue: 'payment_queue',
          queueOptions: { durable: true },
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersCleanupService],
})
export class OrdersModule {
  constructor(private readonly ordersCleanupService: OrdersCleanupService) {}

  onModuleInit() {
    this.ordersCleanupService.expireStaleOrders();
  }
}
