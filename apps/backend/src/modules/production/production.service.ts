import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StockMovementType } from '@prisma/client';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  findOrders() {
    return this.prisma.productionOrder.findMany({
      include: {
        stockItem: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(dto: CreateProductionOrderDto) {
    const stockItem = await this.prisma.stockItem.findUnique({
      where: { id: dto.stockItemId },
    });

    if (!stockItem) {
      throw new NotFoundException('Item de produção não encontrado');
    }

    return this.prisma.productionOrder.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        stockItemId: dto.stockItemId,
        plannedQuantity: dto.plannedQuantity,
        status: 'planned',
      },
      include: {
        stockItem: true,
      },
    });
  }

  async startOrder(id: string) {
    const order = await this.prisma.productionOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Ordem de produção não encontrada');
    }

    if (order.status !== 'planned') {
      throw new BadRequestException('Somente ordens planejadas podem ser iniciadas');
    }

    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
      },
    });
  }

  async finishOrder(id: string) {
    const order = await this.prisma.productionOrder.findUnique({
      where: { id },
      include: {
        stockItem: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Ordem de produção não encontrada');
    }

    if (order.status !== 'in_progress') {
      throw new BadRequestException('A ordem precisa estar em andamento');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          stockItemId: order.stockItemId,
          movementType: StockMovementType.PRODUCTION_OUTPUT,
          movementTypeDetailed: 'production_finish',
          sourceModule: 'production',
          sourceId: order.id,
          quantity: order.plannedQuantity,
          unitCost: order.stockItem.averageCost,
          totalCost: Number(order.plannedQuantity) * Number(order.stockItem.averageCost),
        },
      });

      await tx.stockItem.update({
        where: { id: order.stockItemId },
        data: {
          currentQuantity: Number(order.stockItem.currentQuantity) + Number(order.plannedQuantity),
        },
      });

      return tx.productionOrder.update({
        where: { id },
        data: {
          status: 'finished',
          actualQuantity: order.plannedQuantity,
          finishedAt: new Date(),
        },
      });
    });
  }
}
