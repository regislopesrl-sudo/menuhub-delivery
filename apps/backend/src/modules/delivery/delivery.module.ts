import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService, PrismaService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
