import { Controller, Body, Post } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { CurrentUser } from '../common/decorators';
import type { JwtPayload } from '@ecommerce/shared-types';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    async create(
        @Body() dto: CreateOrderDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<OrderResponseDto> {
        return this.ordersService.createOrder(user.userId, dto);
    }
}