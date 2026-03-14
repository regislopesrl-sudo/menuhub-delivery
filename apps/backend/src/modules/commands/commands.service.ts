import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { OrdersService } from '@/modules/orders/orders.service';
import { PrismaService } from '@/database/prisma.service';
import { AddCommandItemDto } from './dto/add-command-item.dto';
import { OpenCommandDto } from './dto/open-command.dto';

@Injectable()
export class CommandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  private get commandDelegate() {
    return (this.prisma as any).command;
  }

  findAll() {
    return this.commandDelegate.findMany({
      where: { branchId: DEFAULT_BRANCH_ID },
      include: {
        customer: true,
        orders: {
          include: {
            items: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async open(dto: OpenCommandDto) {
    const count = await this.commandDelegate.count({
      where: { branchId: DEFAULT_BRANCH_ID },
    });

    return this.commandDelegate.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        customerId: dto.customerId,
        code: `CMD-${String(count + 1).padStart(4, '0')}`,
        status: 'open',
      },
    });
  }

  async addItem(id: string, dto: AddCommandItemDto) {
    const command = await this.commandDelegate.findUnique({
      where: { id },
    });

    if (!command || command.branchId !== DEFAULT_BRANCH_ID) {
      throw new NotFoundException('Comanda não encontrada');
    }

    return this.ordersService.create({
      customerId: command.customerId ?? undefined,
      commandId: command.id,
      tableId: dto.tableId,
      orderType: dto.orderType,
      channel: 'salon',
      notes: dto.notes,
      items: dto.items,
    });
  }

  async close(id: string) {
    const command = await this.commandDelegate.findUnique({
      where: { id },
    });

    if (!command || command.branchId !== DEFAULT_BRANCH_ID) {
      throw new NotFoundException('Comanda não encontrada');
    }

    return this.commandDelegate.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    });
  }
}
