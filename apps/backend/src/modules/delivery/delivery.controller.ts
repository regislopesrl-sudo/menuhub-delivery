import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { DeliveryService } from './delivery.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';
import { CheckZipcodeDto } from './dto/check-zipcode.dto';
import { ResolveDeliveryAreaDto } from './dto/resolve-delivery-area.dto';

@Controller()
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('couriers')
  @RequirePermission('delivery.view')
  findCouriers() {
    return this.deliveryService.findCouriers();
  }

  @Get('couriers/:id/deliveries')
  @RequirePermission('delivery.view')
  findCourierDeliveries(@Param('id') id: string) {
    return this.deliveryService.findCourierDeliveries(id);
  }

  @Get('delivery/areas')
  @RequirePermission('delivery.view')
  findAreas(@Query('branchId') branchId?: string) {
    return this.deliveryService.findAreas(branchId);
  }

  @Post('delivery/areas')
  createArea(@Body() dto: CreateDeliveryAreaDto) {
    return this.deliveryService.createArea(dto);
  }

  @Patch('delivery/areas/:id')
  updateArea(@Param('id') id: string, @Body() dto: Partial<CreateDeliveryAreaDto>) {
    return this.deliveryService.updateArea(id, dto);
  }

  @Public()
  @Get('delivery/lookup-zip-code')
  lookupZipCode(@Query('zipCode') zipCode: string) {
    return this.deliveryService.lookupZipCode(zipCode);
  }

  @Public()
  @Get('delivery/resolve-area')
  resolveArea(@Query('zipCode') zipCode: string, @Query('branchId') branchId?: string) {
    return this.deliveryService.resolveArea(zipCode, branchId);
  }

  @Public()
  @Post('delivery/check-zipcode')
  checkZipCode(@Body() dto: CheckZipcodeDto) {
    return this.deliveryService.checkZipcode(dto.cep);
  }

  @Post('couriers')
  @RequirePermission('delivery.create_courier')
  createCourier(@Body() dto: CreateCourierDto) {
    return this.deliveryService.createCourier(dto);
  }

  @Patch('couriers/:id')
  @RequirePermission('delivery.update_courier')
  updateCourier(@Param('id') id: string, @Body() dto: Partial<CreateCourierDto>) {
    return this.deliveryService.updateCourier(id, dto);
  }

  @Post('deliveries/assign')
  @RequirePermission('delivery.assign')
  assign(@Body() dto: AssignDeliveryDto) {
    return this.deliveryService.assign(dto);
  }

  @Patch('deliveries/:id/out-for-delivery')
  @RequirePermission('delivery.out_for_delivery')
  outForDelivery(@Param('id') id: string) {
    return this.deliveryService.outForDelivery(id);
  }

  @Patch('deliveries/:id/delivered')
  @RequirePermission('delivery.complete')
  delivered(@Param('id') id: string) {
    return this.deliveryService.delivered(id);
  }

  @Patch('deliveries/:id/failure')
  @RequirePermission('delivery.fail')
  fail(@Param('id') id: string) {
    return this.deliveryService.fail(id);
  }
}
