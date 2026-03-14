import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermission('purchasing.view')
  findAll(@Query() query: any) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('purchasing.view')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @RequirePermission('purchasing.order_create')
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('purchasing.order_create')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('purchasing.order_create')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
