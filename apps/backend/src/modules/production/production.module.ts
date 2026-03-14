import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  controllers: [ProductionController],
  providers: [ProductionService, PrismaService],
  exports: [ProductionService],
})
export class ProductionModule {}
