import type { RawBodyRequest } from '@nestjs/common';
import { BadRequestException, Controller, Headers, Post, Req } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) {}

  @EventPattern('order.created')
  async handleOrderCreated(
    @Payload()
    data: {
      orderId: string;
      stripeChargeAmount: number;
      userId: string;
    },
  ) {
    await this.paymentService.handleOrderCreated(data);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(req.rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.paymentService.handleSucceeded(event);
        break;
      case 'payment_intent.payment_failed':
        await this.paymentService.handleFailed(event);
        break;
      default:
        break;
    }

    return { received: true };
  }
}
