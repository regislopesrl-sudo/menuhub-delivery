import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { BotService } from '../bot/bot.service';
import { WhatsappService } from './whatsapp.service';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { SendWhatsappMessageDto } from './dto/send-whatsapp-message.dto';

@Controller()
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly botService: BotService,
  ) {}

  @Get('webhook/whatsapp')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  @Post('webhook/whatsapp')
  async receive(@Body() body: any) {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    const from = message?.from;
    const messageId = message?.id;
    const text = message?.text?.body;

    if (!from || !text) {
      return { ok: true };
    }

    const reply = await this.botService.handleIncomingMessage(from, text, messageId);
    await this.whatsappService.sendText(from, reply);

    return { ok: true };
  }

  @Get('whatsapp/conversations')
  @Get('conversations')
  @RequirePermission('whatsapp.view')
  findConversations() {
    return this.whatsappService.findConversations();
  }

  @Get('whatsapp/conversations/:id')
  @Get('conversations/:id')
  @RequirePermission('whatsapp.view')
  findConversation(@Param('id') id: string) {
    return this.whatsappService.findConversation(id);
  }

  @Post('whatsapp/conversations/:id/send-message')
  @Post('conversations/:id/send-message')
  @RequirePermission('whatsapp.reply')
  sendMessage(@Param('id') id: string, @Body() dto: SendWhatsappMessageDto) {
    return this.whatsappService.sendMessage(id, dto);
  }

  @Post('whatsapp/conversations/:id/assign')
  @Post('conversations/:id/assign')
  @RequirePermission('whatsapp.assign')
  assign(@Param('id') id: string, @Body() dto: AssignConversationDto) {
    return this.whatsappService.assign(id, dto);
  }

  @Post('whatsapp/conversations/:id/pause-bot')
  @Post('conversations/:id/pause-bot')
  @RequirePermission('whatsapp.pause_bot')
  pauseBot(@Param('id') id: string) {
    return this.whatsappService.pauseBot(id);
  }

  @Post('whatsapp/conversations/:id/resume-bot')
  @Post('conversations/:id/resume-bot')
  @RequirePermission('whatsapp.resume_bot')
  resumeBot(@Param('id') id: string) {
    return this.whatsappService.resumeBot(id);
  }
}
