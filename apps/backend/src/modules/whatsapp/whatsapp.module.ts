import { Module } from '@nestjs/common';
import { BotModule } from '../bot/bot.module';
import { PrismaService } from '@/database/prisma.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [BotModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, PrismaService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
