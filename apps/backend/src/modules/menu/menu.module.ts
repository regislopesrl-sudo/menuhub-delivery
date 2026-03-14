import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { MenuService } from './menu.service';

@Module({
  providers: [MenuService, PrismaService],
  exports: [MenuService],
})
export class MenuModule {}
