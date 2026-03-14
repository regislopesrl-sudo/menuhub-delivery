import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('orders')
  @RequirePermission('reports.view')
  getOrdersReport(@Query() query: any) {
    return this.reportsService.getOrdersReport(query);
  }

  @Get('financial')
  @RequirePermission('reports.view')
  getFinancialReport(@Query() query: any) {
    return this.reportsService.getFinancialReport(query);
  }

  @Get('sales-period')
  @RequirePermission('reports.view')
  getSalesPeriod(@Query() query: any) {
    return this.reportsService.getSalesPeriod(query);
  }

  @Get('stock')
  @RequirePermission('reports.view')
  getStockReport(@Query() query: any) {
    return this.reportsService.getStockReport(query);
  }

  @Get('delivery')
  @RequirePermission('reports.view')
  getDeliveryReport(@Query() query: any) {
    return this.reportsService.getDeliveryReport(query);
  }

  @Get('crm')
  @RequirePermission('reports.view')
  getCrmReport(@Query() query: any) {
    return this.reportsService.getCrmReport(query);
  }

  @Get('whatsapp')
  @RequirePermission('reports.view')
  getWhatsappReport(@Query() query: any) {
    return this.reportsService.getWhatsappReport(query);
  }
}
