import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { SendWhatsappMessageDto } from './dto/send-whatsapp-message.dto';
import { AssignConversationDto } from './dto/assign-conversation.dto';

@Injectable()
export class WhatsappService {
  constructor(private readonly prisma: PrismaService) {}

  async sendText(to: string, text: string) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    const token = process.env.WHATSAPP_TOKEN!;
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao enviar mensagem WhatsApp: ${error}`);
    }

    return response.json();
  }

  findConversations() {
    return this.prisma.whatsappConversation.findMany({
      include: {
        customer: true,
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findConversation(id: string) {
    const conversation = await this.prisma.whatsappConversation.findUnique({
      where: { id },
      include: {
        customer: true,
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });

    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    return conversation;
  }

  async sendMessage(id: string, dto: SendWhatsappMessageDto) {
    await this.findConversation(id);

    return this.prisma.whatsappMessage.create({
      data: {
        conversationId: id,
        direction: 'out',
        messageType: dto.messageType ?? 'text',
        content: dto.content,
      },
    });
  }

  async assign(id: string, dto: AssignConversationDto) {
    await this.findConversation(id);

    return this.prisma.whatsappConversation.update({
      where: { id },
      data: {
        assignedToId: dto.userId,
        status: ConversationStatus.WAITING_HUMAN,
      },
    });
  }

  async pauseBot(id: string) {
    await this.findConversation(id);

    return this.prisma.whatsappConversation.update({
      where: { id },
      data: {
        status: ConversationStatus.PAUSED,
      },
    });
  }

  async resumeBot(id: string) {
    await this.findConversation(id);

    return this.prisma.whatsappConversation.update({
      where: { id },
      data: {
        status: ConversationStatus.BOT_ACTIVE,
      },
    });
  }
}
