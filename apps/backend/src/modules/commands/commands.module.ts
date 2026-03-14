import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { OrdersModule } from '@/modules/orders/orders.module';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';

@Module({
  imports: [OrdersModule],
  controllers: [CommandsController],
  providers: [CommandsService, PrismaService],
  exports: [CommandsService],
})
export class CommandsModule {}
