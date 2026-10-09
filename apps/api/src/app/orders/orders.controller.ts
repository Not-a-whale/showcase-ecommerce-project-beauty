import { Body, Controller, Post } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { CurrentUser } from '../common/decorators';
import * as sharedTypes from '@ecommerce/shared-types';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: sharedTypes.JwtPayload,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(user.userId, dto);
  }

  @EventPattern('payment.succeeded')
  async handlePaymentSucceeded(@Payload() data: { orderId: string }) {
    await this.ordersService.handlePaidOrder(data.orderId);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() data: { orderId: string }) {
    await this.ordersService.handleFailedOrder(data.orderId);
  }
}
