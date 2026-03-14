import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { AddonsService } from './addons.service';
import { CreateAddonGroupDto } from './dto/create-addon-group.dto';
import { UpdateAddonGroupDto } from './dto/update-addon-group.dto';

@Controller('addon-groups')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Get()
  @RequirePermission('addons.view')
  findAll() {
    return this.addonsService.findAll();
  }

  @Get(':id')
  @RequirePermission('addons.view')
  findOne(@Param('id') id: string) {
    return this.addonsService.findOne(id);
  }

  @Post()
  @RequirePermission('addons.create')
  create(@Body() dto: CreateAddonGroupDto) {
    return this.addonsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('addons.update')
  update(@Param('id') id: string, @Body() dto: UpdateAddonGroupDto) {
    return this.addonsService.update(id, dto);
  }
}
