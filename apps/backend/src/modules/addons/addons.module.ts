import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';

@Module({
  controllers: [AddonsController],
  providers: [AddonsService, PrismaService],
  exports: [AddonsService],
})
export class AddonsModule {}
