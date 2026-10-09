import { Inject, Injectable } from '@nestjs/common';
import { PaymentStatus, StripeOrder } from '@ecommerce/shared-types';
import { StripeService } from './stripe.service';
import { EntityManager, Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment } from '../entities/payment.entity';
import { ProcessedEvent } from '../entities/processed-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    @Inject('ORDERS_SERVICE') private client: ClientProxy,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  async handleOrderCreated(order: StripeOrder) {
    const orderWithCents = {
      ...order,
      stripeChargeAmount: Math.round(order.stripeChargeAmount * 100),
    };
    const intent = await this.stripeService.createPaymentIntent(orderWithCents);
    await this.paymentRepo.save({
      orderId: order.orderId,
      stripePaymentIntentId: intent.id,
      amount: order.stripeChargeAmount,
      status: PaymentStatus.CREATED,
    });
    //   4. intent.client_secret — пока залогируй
    console.log(intent.client_secret);
  }

  async handleSucceeded(
    event: Stripe.PaymentIntentSucceededEvent,
  ): Promise<void> {
    const result = await this.processEventOnce(event, async (manager) => {
      const intent = event.data.object;
      const payment = await manager.getRepository(Payment).findOneBy({
        stripePaymentIntentId: intent.id,
      });
      if (!payment) return null;
      if (payment.status === PaymentStatus.SUCCEEDED) return null;

      payment.status = PaymentStatus.SUCCEEDED;
      await manager.getRepository(Payment).save(payment);

      return { orderId: payment.orderId };
    });

    if (result) {
      await lastValueFrom(
        this.client.emit('payment.succeeded', { orderId: result.orderId }),
      );
    }
  }

  async handleFailed(
    event: Stripe.PaymentIntentPaymentFailedEvent,
  ): Promise<void> {
    const result = await this.processEventOnce(event, async (manager) => {
      const intent = event.data.object;
      const payment = await manager.getRepository(Payment).findOneBy({
        stripePaymentIntentId: intent.id,
      });
      if (!payment) return null;

      payment.status = PaymentStatus.FAILED;
      payment.lastError =
        intent.last_payment_error?.message ??
        (intent.last_payment_error
          ? JSON.stringify(intent.last_payment_error)
          : null);
      await manager.getRepository(Payment).save(payment);
      return { orderId: payment.orderId };
    });

    if (result) {
      await lastValueFrom(
        this.client.emit('payment.failed', { orderId: result.orderId }),
      );
    }
  }

  private async processEventOnce<T>(
    event: Stripe.Event,
    work: (manager: EntityManager) => Promise<T | null>,
  ): Promise<T | null> {
    return await this.paymentRepo.manager.transaction(async (manager) => {
      const inserted = await manager
        .createQueryBuilder()
        .insert()
        .into(ProcessedEvent)
        .values({ eventId: event.id, eventType: event.type })
        .orIgnore()
        .execute();

      if (inserted.identifiers.length === 0) {
        return null;
      }

      return await work(manager);
    });
  }
}
