import { Module } from '@nestjs/common';
import { RedisService } from '@/database/redis.service';
import { MenuModule } from '../menu/menu.module';
import { OrdersCoreModule } from '../orders-core/orders-core.module';
import { BotService } from './bot.service';
import { SessionService } from './session.service';

@Module({
  imports: [MenuModule, OrdersCoreModule],
  providers: [BotService, SessionService, RedisService],
  exports: [BotService],
})
export class BotModule {}
