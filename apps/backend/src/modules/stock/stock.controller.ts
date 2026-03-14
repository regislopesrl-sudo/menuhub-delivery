import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { StockService } from './stock.service';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateWasteRecordDto } from './dto/create-waste-record.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('items')
  @RequirePermission('stock.view')
  findItems(@Query() query: Record<string, string | undefined>) {
    return this.stockService.findItems(query);
  }

  @Get('items/:id')
  @RequirePermission('stock.view')
  findItem(@Param('id') id: string) {
    return this.stockService.findItem(id);
  }

  @Post('items')
  @RequirePermission('stock.create')
  createItem(@Body() dto: CreateStockItemDto) {
    return this.stockService.createItem(dto);
  }

  @Patch('items/:id')
  @RequirePermission('stock.update')
  updateItem(@Param('id') id: string, @Body() dto: Partial<CreateStockItemDto>) {
    return this.stockService.updateItem(id, dto);
  }

  @Get('batches')
  @RequirePermission('stock.view')
  findBatches(@Query() query: { stockItemId?: string }) {
    return this.stockService.findBatches(query);
  }

  @Post('batches')
  @RequirePermission('stock.manage_batches')
  createBatch(@Body() dto: CreateStockBatchDto) {
    return this.stockService.createBatch(dto);
  }

  @Post('movements')
  @RequirePermission('stock.adjust')
  createMovement(@Body() dto: CreateStockMovementDto) {
    return this.stockService.createMovement(dto);
  }

  @Post('waste')
  @RequirePermission('stock.register_loss')
  createWaste(@Body() dto: CreateWasteRecordDto) {
    return this.stockService.createWaste(dto);
  }

  @Get('variance')
  @RequirePermission('stock.view_costs')
  getVariance(@Query() query: { start?: string; end?: string }) {
    return this.stockService.getVariance(query);
  }

  @Get('replenishment/suggestions')
  @RequirePermission('stock.view')
  getReplenishmentSuggestions() {
    return this.stockService.getReplenishmentSuggestions();
  }
}

