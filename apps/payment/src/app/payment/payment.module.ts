import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { ProcessedEvent } from '../entities/processed-event.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, ProcessedEvent]),
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://ecommerce:ecommerce_pass@localhost:5672',
          ],
          queue: 'orders_queue',
          queueOptions: { durable: true },
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeService],
})
export class PaymentModule {}
