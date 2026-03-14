import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { KdsService } from './kds.service';

@Controller('kds')
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  @Get('queue')
  @RequirePermission('kds.view')
  getQueue(@Query() query: any) {
    return this.kdsService.getQueue(query);
  }

  @Patch('orders/:id/start')
  @RequirePermission('kds.start')
  startOrder(@Param('id') id: string) {
    return this.kdsService.startOrder(id);
  }

  @Patch('orders/:id/ready')
  @RequirePermission('kds.ready')
  readyOrder(@Param('id') id: string) {
    return this.kdsService.readyOrder(id);
  }

  @Patch('order-items/:id/ready')
  @RequirePermission('kds.ready')
  readyItem(@Param('id') id: string) {
    return this.kdsService.readyItem(id);
  }
}
