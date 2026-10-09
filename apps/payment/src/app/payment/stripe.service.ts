import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeOrder } from '@ecommerce/shared-types';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2026-08-26.dahlia',
      },
    );
    this.webhookSecret =
      configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  async createPaymentIntent(
    order: StripeOrder,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return await this.stripe.paymentIntents.create({
      amount: order.stripeChargeAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { orderId: order.orderId },
    });
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
  }
}
