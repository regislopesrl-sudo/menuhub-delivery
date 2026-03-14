import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { KdsController } from './kds.controller';
import { KdsService } from './kds.service';

@Module({
  controllers: [KdsController],
  providers: [KdsService, PrismaService],
  exports: [KdsService],
})
export class KdsModule {}
