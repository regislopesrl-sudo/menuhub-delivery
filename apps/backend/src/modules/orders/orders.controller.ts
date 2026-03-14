import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { OrdersService } from './orders.service';
import { AddOrderPaymentDto } from './dto/add-order-payment.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermission('orders.view')
  findAll(@Query() query: Record<string, string | undefined>) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('orders.view')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @RequirePermission('orders.create')
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @RequirePermission('orders.change_status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Post(':id/cancel')
  @RequirePermission('orders.cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.ordersService.cancel(id, dto);
  }

  @Post(':id/payments')
  @RequirePermission('orders.update')
  addPayments(@Param('id') id: string, @Body() dto: AddOrderPaymentDto) {
    return this.ordersService.addPayments(id, dto);
  }
}

