import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { WaitlistsController } from './waitlists.controller';
import { WaitlistsService } from './waitlists.service';

@Module({
  controllers: [WaitlistsController],
  providers: [WaitlistsService, PrismaService],
  exports: [WaitlistsService],
})
export class WaitlistsModule {}
