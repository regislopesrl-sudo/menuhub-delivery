import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { WaitlistsService } from './waitlists.service';

@Controller('waitlist')
export class WaitlistsController {
  constructor(private readonly waitlistsService: WaitlistsService) {}

  @Get()
  @RequirePermission('reservations.view')
  findAll() {
    return this.waitlistsService.findAll();
  }

  @Post()
  @RequirePermission('reservations.create')
  create(@Body() dto: CreateWaitlistDto) {
    return this.waitlistsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('reservations.update')
  update(@Param('id') id: string, @Body() dto: UpdateWaitlistDto) {
    return this.waitlistsService.update(id, dto);
  }
}
