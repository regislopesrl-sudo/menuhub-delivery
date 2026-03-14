import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';

@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Get()
  @RequirePermission('combos.view')
  findAll() {
    return this.combosService.findAll();
  }

  @Get(':id')
  @RequirePermission('combos.view')
  findOne(@Param('id') id: string) {
    return this.combosService.findOne(id);
  }

  @Post()
  @RequirePermission('combos.create')
  create(@Body() dto: CreateComboDto) {
    return this.combosService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('combos.update')
  update(@Param('id') id: string, @Body() dto: UpdateComboDto) {
    return this.combosService.update(id, dto);
  }
}
