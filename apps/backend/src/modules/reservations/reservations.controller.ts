import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @RequirePermission('reservations.view')
  findAll() {
    return this.reservationsService.findAll();
  }

  @Post()
  @RequirePermission('reservations.create')
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('reservations.update')
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(id, dto);
  }
}
