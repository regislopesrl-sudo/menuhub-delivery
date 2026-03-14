import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { PurchasingService } from './purchasing.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Controller('purchasing')
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) {}

  @Get('requests')
  @RequirePermission('purchasing.view')
  findRequests() {
    return this.purchasingService.findRequests();
  }

  @Post('requests')
  @RequirePermission('purchasing.request_create')
  createRequest(@Body() dto: CreatePurchaseRequestDto) {
    return this.purchasingService.createRequest(dto);
  }

  @Get('orders')
  @RequirePermission('purchasing.view')
  findOrders() {
    return this.purchasingService.findOrders();
  }

  @Post('orders')
  @RequirePermission('purchasing.order_create')
  createOrder(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchasingService.createOrder(dto);
  }

  @Patch('orders/:id')
  @RequirePermission('purchasing.order_create')
  updateOrder(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchasingService.updateOrder(id, dto);
  }

  @Patch('orders/:id/approve')
  @RequirePermission('purchasing.order_approve')
  approveOrder(@Param('id') id: string) {
    return this.purchasingService.approveOrder(id);
  }

  @Get('receipts')
  @RequirePermission('purchasing.view')
  findReceipts() {
    return this.purchasingService.findReceipts();
  }

  @Post('receipts')
  @RequirePermission('purchasing.receipt_create')
  createReceipt(@Body() dto: CreateGoodsReceiptDto) {
    return this.purchasingService.createReceipt(dto);
  }

  @Post('receipts/:id/finalize')
  @RequirePermission('purchasing.receipt_finalize')
  finalizeReceipt(@Param('id') id: string) {
    return this.purchasingService.finalizeReceipt(id);
  }
}
