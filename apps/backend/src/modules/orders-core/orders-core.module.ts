import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RedisService } from '@/database/redis.service';
import { DeliveryFeesModule } from '../delivery-fees/delivery-fees.module';
import { MenuModule } from '../menu/menu.module';
import { OrdersModule } from '../orders/orders.module';
import { OrdersCoreController } from './orders-core.controller';
import { OrdersCoreService } from './orders-core.service';

@Module({
  imports: [MenuModule, DeliveryFeesModule, OrdersModule],
  controllers: [OrdersCoreController],
  providers: [OrdersCoreService, PrismaService, RedisService],
  exports: [OrdersCoreService],
})
export class OrdersCoreModule {}
