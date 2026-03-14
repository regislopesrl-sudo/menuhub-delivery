import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission('customers.view')
  findAll(@Query() query: Record<string, string | undefined>) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('customers.view')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @RequirePermission('customers.create')
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('customers.update')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Get(':id/orders')
  @RequirePermission('customers.view')
  getOrders(@Param('id') id: string) {
    return this.customersService.getOrders(id);
  }

  @Delete(':id')
  @RequirePermission('customers.delete')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
