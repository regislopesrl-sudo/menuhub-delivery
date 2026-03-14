import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

@Module({
  controllers: [TablesController],
  providers: [TablesService, PrismaService],
  exports: [TablesService],
})
export class TablesModule {}
