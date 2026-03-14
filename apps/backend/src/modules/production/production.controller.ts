import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { ProductionService } from './production.service';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('orders')
  @RequirePermission('production.view')
  findOrders() {
    return this.productionService.findOrders();
  }

  @Post('orders')
  @RequirePermission('production.create')
  createOrder(@Body() dto: CreateProductionOrderDto) {
    return this.productionService.createOrder(dto);
  }

  @Post('orders/:id/start')
  @RequirePermission('production.start')
  startOrder(@Param('id') id: string) {
    return this.productionService.startOrder(id);
  }

  @Post('orders/:id/finish')
  @RequirePermission('production.finish')
  finishOrder(@Param('id') id: string) {
    return this.productionService.finishOrder(id);
  }
}
