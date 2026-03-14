import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeliveryAreasService } from './delivery-areas.service';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';
import { UpdateDeliveryAreaDto } from './dto/update-delivery-area.dto';
import { CheckZipcodeDto } from './dto/check-zipcode.dto';

@Controller()
export class DeliveryAreasController {
  constructor(private readonly deliveryAreasService: DeliveryAreasService) {}

  @Get('delivery-areas')
  @RequirePermission('delivery.view')
  findAll(@Query() query: any) {
    return this.deliveryAreasService.findAll(query);
  }

  @Get('delivery-areas/:id')
  @RequirePermission('delivery.view')
  findOne(@Param('id') id: string) {
    return this.deliveryAreasService.findOne(id);
  }

  @Post('delivery-areas')
  @RequirePermission('delivery.assign')
  create(@Body() dto: CreateDeliveryAreaDto) {
    return this.deliveryAreasService.create(dto);
  }

  @Patch('delivery-areas/:id')
  @RequirePermission('delivery.assign')
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryAreaDto) {
    return this.deliveryAreasService.update(id, dto);
  }

  @Post('delivery/check-zipcode')
  @RequirePermission('delivery.view')
  checkZipcode(@Body() dto: CheckZipcodeDto) {
    return this.deliveryAreasService.checkZipcode(dto.cep);
  }
}
