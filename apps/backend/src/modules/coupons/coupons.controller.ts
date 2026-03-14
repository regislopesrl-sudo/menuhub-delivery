import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @RequirePermission('coupons.view')
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @RequirePermission('coupons.view')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Post()
  @RequirePermission('coupons.create')
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('coupons.update')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }
}
