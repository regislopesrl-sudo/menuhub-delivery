import { Body, Controller, Get, Patch } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermission('settings.view')
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  @RequirePermission('settings.update')
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
