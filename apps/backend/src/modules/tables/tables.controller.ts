import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CreateTableDto } from './dto/create-table.dto';
import { OpenTableDto } from './dto/open-table.dto';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @RequirePermission('tables.view')
  findAll() {
    return this.tablesService.findAll();
  }

  @Post()
  @RequirePermission('tables.update')
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @Post('open')
  @RequirePermission('tables.open')
  open(@Body() dto: OpenTableDto) {
    return this.tablesService.open(dto);
  }

  @Post(':id/close')
  @RequirePermission('tables.close')
  close(@Param('id') id: string) {
    return this.tablesService.close(id);
  }
}
