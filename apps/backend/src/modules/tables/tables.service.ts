import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, OrderType, Prisma, TableStatus } from '@prisma/client';
import { DEFAULT_BRANCH_ID, DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { OpenTableDto } from './dto/open-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  private get tableDelegate() {
    return (this.prisma as any).tableRestaurant;
  }

  findTables() {
    return this.tableDelegate.findMany({
      where: { branchId: DEFAULT_BRANCH_ID },
      include: {
        orders: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        reservations: {
          orderBy: { reservationAt: 'asc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  findOpenCommands() {
    return this.prisma.command.findMany({
      where: {
        branchId: DEFAULT_BRANCH_ID,
        status: 'open',
      },
      include: {
        tableRestaurant: true,
        customer: true,
        orders: {
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { openedAt: 'asc' },
    });
  }

  create(dto: CreateTableDto) {
    return this.tableDelegate.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        name: dto.name,
        capacity: dto.capacity ?? 4,
        qrCode: dto.qrCode,
      },
    });
  }

  async open(dto: OpenTableDto) {
    const table = await this.tableDelegate.findUnique({
      where: { id: dto.tableId },
    });

    if (!table || table.branchId !== DEFAULT_BRANCH_ID) {
      throw new NotFoundException('Mesa não encontrada');
    }

    return this.tableDelegate.update({
      where: { id: dto.tableId },
      data: {
        status: TableStatus.OCCUPIED,
      },
    });
  }

  async close(id: string) {
    const table = await this.tableDelegate.findUnique({
      where: { id },
    });

    if (!table || table.branchId !== DEFAULT_BRANCH_ID) {
      throw new NotFoundException('Mesa não encontrada');
    }

    return this.tableDelegate.update({
      where: { id },
      data: {
        status: TableStatus.FREE,
      },
    });
  }

  async openCommand(dto: { tableId?: string; customerId?: string; code: string }) {
    const table = dto.tableId
      ? await this.tableDelegate.findUnique({ where: { id: dto.tableId } })
      : null;

    if (dto.tableId && (!table || table.branchId !== DEFAULT_BRANCH_ID)) {
      throw new NotFoundException('Mesa não encontrada');
    }

    if (!dto.code.trim()) {
      throw new BadRequestException('Código obrigatório');
    }

    const existing = await this.prisma.command.findFirst({
      where: {
        branchId: DEFAULT_BRANCH_ID,
        code: dto.code.trim(),
        status: 'open',
      },
    });

    if (existing) {
      throw new BadRequestException('Comanda já aberta com esse código');
    }

    if (table) {
      await this.tableDelegate.update({
        where: { id: table.id },
        data: { status: TableStatus.OCCUPIED },
      });
    }

    return this.prisma.command.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        tableRestaurantId: table?.id,
        customerId: dto.customerId,
        code: dto.code.trim(),
      },
    });
  }

  async closeCommand(id: string) {
    const command = await this.prisma.command.findUnique({
      where: { id },
      include: { tableRestaurant: true },
    });

    if (!command) {
      throw new NotFoundException('Comanda não encontrada');
    }

    await this.prisma.command.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    });

    if (command.tableRestaurantId) {
      await this.tableDelegate.update({
        where: { id: command.tableRestaurantId },
        data: { status: TableStatus.FREE },
      });
    }

    return { success: true };
  }

  async transferCommand(
    id: string,
    dto: { targetTableId?: string; targetCommandId?: string },
  ) {
    const command = await this.prisma.command.findUnique({
      where: { id },
      include: { tableRestaurant: true },
    });

    if (!command) {
      throw new NotFoundException('Comanda não encontrada');
    }

    if (dto.targetCommandId) {
      const target = await this.prisma.command.findUnique({
        where: { id: dto.targetCommandId },
      });

      if (!target) {
        throw new NotFoundException('Comanda de destino não encontrada');
      }

      await this.prisma.order.updateMany({
        where: { commandId: command.id },
        data: { commandId: target.id },
      });

      await this.closeCommand(command.id);
      return { mergedInto: target.id };
    }

    if (dto.targetTableId) {
      const targetTable = await this.tableDelegate.findUnique({
        where: { id: dto.targetTableId },
      });

      if (!targetTable || targetTable.branchId !== DEFAULT_BRANCH_ID) {
        throw new NotFoundException('Mesa de destino não encontrada');
      }

      if (command.tableRestaurantId && command.tableRestaurantId !== targetTable.id) {
        await this.tableDelegate.update({
          where: { id: command.tableRestaurantId },
          data: { status: TableStatus.FREE },
        });
      }

      await this.tableDelegate.update({
        where: { id: targetTable.id },
        data: { status: TableStatus.OCCUPIED },
      });

      await this.prisma.command.update({
        where: { id },
        data: { tableRestaurantId: targetTable.id },
      });

      return { tableId: targetTable.id };
    }

  throw new BadRequestException('Destino de transferência obrigatório');
}

  async transferCommandItems(
    id: string,
    dto: {
      targetCommandId: string;
      itemTransfers: Array<{
        orderItemId: string;
        quantity: number;
      }>;
    },
  ) {
    if (!dto.targetCommandId) {
      throw new BadRequestException('Comanda de destino obrigatória');
    }

    return this.prisma.$transaction(async (tx) => {
      const sourceCommand = await tx.command.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!sourceCommand) throw new NotFoundException('Comanda não encontrada');

      const targetCommand = await tx.command.findUnique({
        where: { id: dto.targetCommandId },
      });

      if (!targetCommand) {
        throw new NotFoundException('Comanda de destino não encontrada');
      }

      if (targetCommand.status !== 'open') {
        throw new BadRequestException('Comanda de destino precisa estar aberta');
      }

      if (!dto.itemTransfers.length) {
        throw new BadRequestException('Informe os itens que devem ser transferidos');
      }

      const groupedTransfers = new Map<string, Prisma.Decimal>();

      for (const item of dto.itemTransfers) {
        const qty = new Prisma.Decimal(item.quantity);
        if (qty.lte(0)) {
          throw new BadRequestException('Quantidade deve ser maior que zero');
        }

        groupedTransfers.set(
          item.orderItemId,
          (groupedTransfers.get(item.orderItemId) ?? new Prisma.Decimal(0)).add(qty),
        );
      }

      const orderItemIds = Array.from(groupedTransfers.keys());

      const items = await tx.orderItem.findMany({
        where: { id: { in: orderItemIds } },
        include: {
          order: true,
        },
      });

      if (items.length !== orderItemIds.length) {
        throw new NotFoundException('Algum item informado não foi encontrado');
      }

      const transferredItems: {
        orderItem: Prisma.OrderItemGetPayload<{
          include: { order: true };
        }>;
        quantity: Prisma.Decimal;
      }[] = [];

      const orderAdjustments = new Map<string, Prisma.Decimal>();

      for (const item of items) {
        if (item.order.commandId !== sourceCommand.id) {
          throw new BadRequestException('Item não pertence à comanda de origem');
        }

        const transferQty = groupedTransfers.get(item.id)!;
        const currentQty = new Prisma.Decimal(item.quantity);

        if (transferQty.gt(currentQty)) {
          throw new BadRequestException('Quantidade maior do que a disponível');
        }

        const remainingQty = currentQty.sub(transferQty);
        const unitPrice = new Prisma.Decimal(item.unitPrice);
        const transferAmount = unitPrice.mul(transferQty);

        orderAdjustments.set(
          item.orderId,
          (orderAdjustments.get(item.orderId) ?? new Prisma.Decimal(0)).add(transferAmount),
        );

        if (remainingQty.gt(0)) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: {
              quantity: remainingQty,
              totalPrice: unitPrice.mul(remainingQty),
            },
          });
        } else {
          await tx.orderItem.delete({ where: { id: item.id } });
        }

        transferredItems.push({ orderItem: item, quantity: transferQty });
      }

      for (const [orderId, removedAmount] of orderAdjustments.entries()) {
        const order = sourceCommand.orders.find((o) => o.id === orderId);
        if (!order) continue;

        await tx.order.update({
          where: { id: orderId },
          data: {
            subtotal: new Prisma.Decimal(order.subtotal).sub(removedAmount),
            totalAmount: new Prisma.Decimal(order.totalAmount).sub(removedAmount),
          },
        });
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const countToday = await tx.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
      });

      const orderNumber = String(countToday + 1).padStart(6, '0');
      let subtotal = new Prisma.Decimal(0);

      const itemsForCreation = transferredItems.map(({ orderItem, quantity }) => {
        const existingUnitPrice = new Prisma.Decimal(orderItem.unitPrice);
        const totalPrice = existingUnitPrice.mul(quantity);
        subtotal = subtotal.add(totalPrice);

        return {
          productId: orderItem.productId ?? undefined,
          productNameSnapshot: orderItem.productNameSnapshot,
          quantity,
          unitPrice: existingUnitPrice,
          costSnapshot: orderItem.costSnapshot,
          theoreticalCostSnapshot: orderItem.theoreticalCostSnapshot ?? undefined,
          totalPrice,
          notes: orderItem.notes,
        };
      });

      if (!itemsForCreation.length) {
        throw new BadRequestException('Nenhum item transferido');
      }

      const newOrder = await tx.order.create({
        data: {
          companyId: DEFAULT_COMPANY_ID,
          branchId: DEFAULT_BRANCH_ID,
          customerId: targetCommand.customerId ?? sourceCommand.customerId ?? undefined,
          tableId: targetCommand.tableRestaurantId ?? undefined,
          deliveryAreaId: sourceCommand.tableRestaurantId ? undefined : undefined,
          orderNumber,
          orderType: OrderType.COMMAND,
          channel: 'command',
          status: OrderStatus.PENDING_CONFIRMATION,
          subtotal,
          discountAmount: new Prisma.Decimal(0),
          deliveryFee: new Prisma.Decimal(0),
          extraFee: new Prisma.Decimal(0),
          totalAmount: subtotal,
          commandId: targetCommand.id,
          items: {
            create: itemsForCreation,
          },
        },
      });

      return {
        success: true,
        newOrderId: newOrder.id,
        transferredItems: itemsForCreation.length,
      };
    });
  }

  async mergeCommands(targetCommandId: string, sourceCommandId: string) {
    if (targetCommandId === sourceCommandId) {
      throw new BadRequestException('Comandas devem ser distintas');
    }

    const [targetCommand, sourceCommand] = await Promise.all([
      this.prisma.command.findUnique({
        where: { id: targetCommandId },
      }),
      this.prisma.command.findUnique({
        where: { id: sourceCommandId },
      }),
    ]);

    if (!targetCommand) {
      throw new NotFoundException('Comanda destino não encontrada');
    }

    if (!sourceCommand) {
      throw new NotFoundException('Comanda origem não encontrada');
    }

    if (targetCommand.status !== 'open' || sourceCommand.status !== 'open') {
      throw new BadRequestException('Ambas as comandas precisam estar abertas');
    }

    const movedOrders = await this.prisma.order.updateMany({
      where: { commandId: sourceCommandId },
      data: { commandId: targetCommandId },
    });

    await this.prisma.command.update({
      where: { id: sourceCommandId },
      data: {
        status: 'merged',
        closedAt: new Date(),
      },
    });

    return {
      success: true,
      mergedOrders: movedOrders.count,
    };
  }

  findCommand(id: string) {
    return this.prisma.command.findUnique({
      where: { id },
      include: {
        tableRestaurant: true,
        customer: true,
        orders: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });
  }

  async registerPartialCommandPayments(
    id: string,
    dto: {
      payments: Array<{
        personName?: string;
        paymentMethod: string;
        amount: number;
        transactionReference?: string;
      }>;
    },
  ) {
    const command = await this.prisma.command.findUnique({
      where: { id },
      include: {
        orders: {
          where: { deletedAt: null },
        },
      },
    });

    if (!command) {
      throw new NotFoundException('Comanda não encontrada');
    }

    const totalAmount = command.orders.reduce(
      (acc, order) => acc + Number(order.totalAmount ?? 0),
      0,
    );

    const totalPaid = dto.payments.reduce(
      (acc, payment) => acc + Number(payment.amount ?? 0),
      0,
    );

    return {
      commandId: command.id,
      totalAmount,
      totalPaid,
      remainingAmount: Number((totalAmount - totalPaid).toFixed(2)),
      payments: dto.payments,
    };
  }
}
