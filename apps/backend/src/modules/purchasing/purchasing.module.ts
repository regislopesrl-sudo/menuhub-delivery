import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PurchasingController } from './purchasing.controller';
import { PurchasingService } from './purchasing.service';

@Module({
  controllers: [PurchasingController],
  providers: [PurchasingService, PrismaService],
  exports: [PurchasingService],
})
export class PurchasingModule {}

