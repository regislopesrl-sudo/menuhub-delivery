import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class KdsService {
  constructor(private readonly prisma: PrismaService) {}

  getQueue(query: { channel?: string }) {
    return this.prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.IN_PREPARATION],
        },
        channel: query.channel,
      },
      include: {
        items: {
          include: {
            addons: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async startOrder(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.IN_PREPARATION,
        preparationStartedAt: new Date(),
        statusLogs: {
          create: {
            previousStatus: order.status,
            newStatus: OrderStatus.IN_PREPARATION,
            notes: 'Iniciado no KDS',
          },
        },
      },
    });
  }

  async readyOrder(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.READY,
        readyAt: new Date(),
        statusLogs: {
          create: {
            previousStatus: order.status,
            newStatus: OrderStatus.READY,
            notes: 'Pedido pronto no KDS',
          },
        },
      },
    });
  }

  async readyItem(id: string) {
    const item = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item do pedido não encontrado');

    return this.prisma.orderItem.update({
      where: { id },
      data: {
        status: 'ready',
      },
    });
  }
}
