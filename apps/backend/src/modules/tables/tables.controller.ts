import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { TablesService } from './tables.service';

@Controller()
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('tables')
  @RequirePermission('orders.view')
  findTables() {
    return this.tablesService.findTables();
  }

  @Post('commands/open')
  @RequirePermission('orders.create')
  openCommand(@Body() dto: { tableId?: string; customerId?: string; code: string }) {
    return this.tablesService.openCommand(dto);
  }

  @Patch('commands/:id/close')
  @RequirePermission('orders.update')
  closeCommand(@Param('id') id: string) {
    return this.tablesService.closeCommand(id);
  }

  @Patch('commands/:id/transfer-items')
  @RequirePermission('orders.update')
  transferCommandItems(
    @Param('id') id: string,
    @Body()
    dto: {
      targetCommandId: string;
      itemTransfers: Array<{
        orderItemId: string;
        quantity: number;
      }>;
    },
  ) {
    return this.tablesService.transferCommandItems(id, dto);
  }

  @Post('commands/:id/partial-payments')
  @RequirePermission('orders.update')
  registerPartialCommandPayments(
    @Param('id') id: string,
    @Body()
    dto: {
      payments: Array<{
        personName?: string;
        paymentMethod: string;
        amount: number;
        transactionReference?: string;
      }>;
    },
  ) {
    return this.tablesService.registerPartialCommandPayments(id, dto);
  }

  @Patch('commands/:id/merge')
  @RequirePermission('orders.update')
  mergeCommands(
    @Param('id') id: string,
    @Body() dto: { sourceCommandId: string },
  ) {
    return this.tablesService.mergeCommands(id, dto.sourceCommandId);
  }

  @Get('commands/:id')
  @RequirePermission('orders.view')
  findCommand(@Param('id') id: string) {
    return this.tablesService.findCommand(id);
  }
}
