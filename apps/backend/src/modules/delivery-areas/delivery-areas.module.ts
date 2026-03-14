import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { DeliveryAreasController } from './delivery-areas.controller';
import { DeliveryAreasService } from './delivery-areas.service';

@Module({
  controllers: [DeliveryAreasController],
  providers: [DeliveryAreasService, PrismaService],
  exports: [DeliveryAreasService],
})
export class DeliveryAreasModule {}
