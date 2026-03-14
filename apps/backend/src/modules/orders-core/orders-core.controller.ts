import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { QuoteOrderDto } from './dto/quote-order.dto';
import { OrdersCoreService } from './orders-core.service';

@Controller('public')
export class OrdersCoreController {
  constructor(private readonly ordersCoreService: OrdersCoreService) {}

  @Post('checkout/quote')
  quote(@Body() dto: QuoteOrderDto) {
    return this.ordersCoreService.quote(dto);
  }

  @Post('orders')
  create(@Body() dto: CreateOrderDto) {
    return this.ordersCoreService.create(dto);
  }
}
