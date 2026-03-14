import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { AddCommandItemDto } from './dto/add-command-item.dto';
import { OpenCommandDto } from './dto/open-command.dto';
import { CommandsService } from './commands.service';

@Controller('commands')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Get()
  @RequirePermission('commands.view')
  findAll() {
    return this.commandsService.findAll();
  }

  @Post('open')
  @RequirePermission('commands.open')
  open(@Body() dto: OpenCommandDto) {
    return this.commandsService.open(dto);
  }

  @Post(':id/add-item')
  @RequirePermission('commands.add_item')
  addItem(@Param('id') id: string, @Body() dto: AddCommandItemDto) {
    return this.commandsService.addItem(id, dto);
  }

  @Post(':id/close')
  @RequirePermission('commands.close')
  close(@Param('id') id: string) {
    return this.commandsService.close(id);
  }
}
