import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';

@Module({
  controllers: [CombosController],
  providers: [CombosService, PrismaService],
  exports: [CombosService],
})
export class CombosModule {}
