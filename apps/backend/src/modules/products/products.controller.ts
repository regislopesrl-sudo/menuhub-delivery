import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('products.view')
  findAll(@Query() query: Record<string, string | undefined>) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('products.view')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @RequirePermission('products.create')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('products.update')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/toggle')
  @RequirePermission('products.toggle')
  toggle(@Param('id') id: string) {
    return this.productsService.toggle(id);
  }

  @Delete(':id')
  @RequirePermission('products.delete')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
