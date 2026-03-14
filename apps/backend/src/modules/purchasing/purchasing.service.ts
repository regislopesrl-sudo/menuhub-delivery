import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchasingService {
  constructor(private readonly prisma: PrismaService) {}

  findRequests() {
    return this.prisma.purchaseRequest.findMany({
      include: { items: { include: { stockItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  createRequest(dto: CreatePurchaseRequestDto) {
    if (!dto.items.length) throw new BadRequestException('A solicitação precisa ter itens');
    return this.prisma.purchaseRequest.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        notes: dto.notes,
        items: { create: dto.items.map((item) => ({ stockItemId: item.stockItemId, quantity: item.quantity, notes: item.notes })) },
      },
      include: { items: true },
    });
  }

  findOrders() {
    return this.prisma.purchaseOrder.findMany({
      include: { supplier: true, items: { include: { stockItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  createOrder(dto: CreatePurchaseOrderDto) {
    if (!dto.items.length) throw new BadRequestException('O pedido de compra precisa ter itens');
    const totalAmount = dto.items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
    return this.prisma.purchaseOrder.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        supplierId: dto.supplierId,
        status: 'draft',
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
        totalAmount,
        notes: dto.notes,
        items: { create: dto.items.map((item) => ({ stockItemId: item.stockItemId, quantity: item.quantity, unitCost: item.unitCost, totalCost: item.quantity * item.unitCost })) },
      },
      include: { supplier: true, items: true },
    });
  }

  async updateOrder(id: string, dto: UpdatePurchaseOrderDto) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Pedido de compra não encontrado');
    if (!['draft', 'approved'].includes(order.status)) {
      throw new BadRequestException('Somente pedidos editáveis podem ser alterados');
    }

    const totalAmount = dto.items?.length
      ? dto.items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0)
      : Number(order.totalAmount ?? 0);

    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          supplierId: dto.supplierId,
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
          notes: dto.notes,
          totalAmount,
          items: dto.items
            ? {
                create: dto.items.map((item) => ({
                  stockItemId: item.stockItemId,
                  quantity: item.quantity,
                  unitCost: item.unitCost,
                  totalCost: item.quantity * item.unitCost,
                })),
              }
            : undefined,
        },
        include: {
          supplier: true,
          items: {
            include: {
              stockItem: true,
            },
          },
        },
      });
    });
  }

  async approveOrder(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido de compra não encontrado');
    if (order.status !== 'draft') throw new BadRequestException('Somente pedidos em rascunho podem ser aprovados');
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status: 'approved' } });
  }

  findReceipts() {
    return this.prisma.goodsReceipt.findMany({
      include: { supplier: true, purchaseOrder: true, items: { include: { stockItem: true, batch: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  createReceipt(dto: CreateGoodsReceiptDto) {
    if (!dto.items.length) throw new BadRequestException('O recebimento precisa ter itens');
    return this.prisma.goodsReceipt.create({
      data: {
        purchaseOrderId: dto.purchaseOrderId,
        supplierId: dto.supplierId,
        invoiceNumber: dto.invoiceNumber,
        invoiceKey: dto.invoiceKey,
        status: 'pending',
        items: { create: dto.items.map((item) => ({ stockItemId: item.stockItemId, batchId: item.batchId, orderedQuantity: item.orderedQuantity, receivedQuantity: item.receivedQuantity, unitCost: item.unitCost, hasDivergence: item.hasDivergence ?? false, divergenceNotes: item.divergenceNotes })) },
      },
      include: { items: true },
    });
  }

  async finalizeReceipt(id: string) {
    const receipt = await this.prisma.goodsReceipt.findUnique({ where: { id }, include: { items: true } });
    if (!receipt) throw new NotFoundException('Recebimento não encontrado');
    if (receipt.status === 'finalized') throw new BadRequestException('Recebimento já finalizado');

    return this.prisma.$transaction(async (tx) => {
      for (const item of receipt.items) {
        await tx.stockMovement.create({
          data: {
            stockItemId: item.stockItemId,
            batchId: item.batchId ?? undefined,
            movementType: 'ENTRY' as any,
            movementTypeDetailed: 'purchase_receipt',
            sourceModule: 'purchasing',
            sourceId: receipt.id,
            quantity: item.receivedQuantity,
            unitCost: item.unitCost,
            totalCost: Number(item.receivedQuantity) * Number(item.unitCost),
          },
        });
        const stockItem = await tx.stockItem.findUnique({ where: { id: item.stockItemId } });
        if (!stockItem) throw new NotFoundException('Item de estoque não encontrado no recebimento');
        const currentQuantity = Number(stockItem.currentQuantity);
        const receivedQuantity = Number(item.receivedQuantity);
        const lastCost = Number(item.unitCost);
        const averageCost =
          currentQuantity + receivedQuantity > 0
            ? ((currentQuantity * Number(stockItem.averageCost)) + receivedQuantity * lastCost) /
              (currentQuantity + receivedQuantity)
            : lastCost;
        await tx.stockItem.update({
          where: { id: item.stockItemId },
          data: {
            currentQuantity: currentQuantity + receivedQuantity,
            lastCost,
            averageCost,
          },
        });
      }
      return tx.goodsReceipt.update({
        where: { id },
        data: { status: 'finalized', receivedAt: new Date() },
        include: { items: true },
      });
    });
  }
}
