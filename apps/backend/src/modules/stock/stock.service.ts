import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateWasteRecordDto } from './dto/create-waste-record.dto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async findItems(query: { search?: string; page?: string; pageSize?: string }) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const skip = (page - 1) * pageSize;
    const where = {
      isActive: true,
      name: query.search ? { contains: query.search, mode: 'insensitive' as const } : undefined,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockItem.findMany({ where, include: { batches: true }, orderBy: { name: 'asc' }, skip, take: pageSize }),
      this.prisma.stockItem.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findItem(id: string) {
    const item = await this.prisma.stockItem.findUnique({
      where: { id },
      include: { batches: true, movements: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    if (!item) throw new NotFoundException('Item de estoque não encontrado');
    return item;
  }

  createItem(dto: CreateStockItemDto) {
    return this.prisma.stockItem.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        categoryId: dto.categoryId,
        supplierId: dto.supplierId,
        name: dto.name,
        code: dto.code,
        purchaseUnit: dto.purchaseUnit,
        stockUnit: dto.stockUnit,
        productionUnit: dto.productionUnit,
        conversionFactor: dto.conversionFactor ?? 1,
        minimumQuantity: dto.minimumQuantity ?? 0,
        reorderPoint: dto.reorderPoint ?? 0,
        averageCost: dto.averageCost ?? 0,
        lastCost: dto.lastCost ?? 0,
        standardCost: dto.standardCost ?? 0,
        leadTimeDays: dto.leadTimeDays ?? 0,
        controlsBatch: dto.controlsBatch ?? false,
        controlsExpiry: dto.controlsExpiry ?? false,
        requiresFefo: dto.requiresFefo ?? false,
        isPerishable: dto.isPerishable ?? false,
        isFractionable: dto.isFractionable ?? false,
        isCritical: dto.isCritical ?? false,
        isHighTurnover: dto.isHighTurnover ?? false,
      },
    });
  }

  async updateItem(id: string, dto: Partial<CreateStockItemDto>) {
    await this.findItem(id);
    return this.prisma.stockItem.update({ where: { id }, data: dto });
  }

  findBatches(query: { stockItemId?: string }) {
    return this.prisma.stockBatch.findMany({
      where: { stockItemId: query.stockItemId },
      include: { stockItem: true },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  createBatch(dto: CreateStockBatchDto) {
    return this.prisma.stockBatch.create({
      data: {
        stockItemId: dto.stockItemId,
        supplierId: dto.supplierId,
        batchNumber: dto.batchNumber,
        manufactureDate: dto.manufactureDate ? new Date(dto.manufactureDate) : undefined,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : undefined,
        openedDate: dto.openedDate ? new Date(dto.openedDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        useUntilDate: dto.useUntilDate ? new Date(dto.useUntilDate) : undefined,
        initialQuantity: dto.initialQuantity,
        availableQuantity: dto.initialQuantity,
        unitCost: dto.unitCost,
        sanitaryNotes: dto.sanitaryNotes,
      },
    });
  }

  async createMovement(dto: CreateStockMovementDto) {
    const item = await this.findItem(dto.stockItemId);
    const entryTypes = ['ENTRY', 'PRODUCTION_OUTPUT', 'RETURN'];
    const movementType = dto.movementType;
    const current = Number(item.currentQuantity);
    const nextQuantity = entryTypes.includes(movementType)
      ? current + Number(dto.quantity)
      : current - Number(dto.quantity);
    return this.prisma.$transaction(async (tx) => {
        await tx.stockMovement.create({
          data: {
            stockItemId: dto.stockItemId,
            batchId: dto.batchId,
            movementType: movementType as any,
            movementTypeDetailed: dto.movementTypeDetailed,
            sourceModule: dto.sourceModule,
            sourceId: dto.sourceId,
          quantity: dto.quantity,
          unitCost: dto.unitCost ?? 0,
          totalCost: (dto.unitCost ?? 0) * dto.quantity,
          reasonCode: dto.reasonCode,
          notes: dto.notes,
        },
      });
      return tx.stockItem.update({
        where: { id: dto.stockItemId },
        data: { currentQuantity: nextQuantity },
      });
    });
  }

  createWaste(dto: CreateWasteRecordDto) {
    return this.prisma.stockMovement.create({
      data: {
        stockItemId: dto.stockItemId,
        batchId: dto.batchId,
        movementType: 'LOSS' as any,
        movementTypeDetailed: 'waste',
        quantity: dto.quantity,
        totalCost: dto.amount,
        notes: dto.notes ?? dto.reason,
      },
    });
  }

  getVariance(query: { start?: string; end?: string }) {
    return {
      period: { start: query.start, end: query.end },
      items: [],
      summary: { theoreticalCost: 0, actualCost: 0, varianceAmount: 0, variancePercent: 0 },
    };
  }

  async getReplenishmentSuggestions() {
    const items = await this.prisma.stockItem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return items.filter((item) => Number(item.currentQuantity) <= Number(item.reorderPoint));
  }
}
