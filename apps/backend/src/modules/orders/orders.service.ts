import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, OrderType, Prisma } from '@prisma/client';
import { DEFAULT_BRANCH_ID, DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { AddOrderPaymentDto } from './dto/add-order-payment.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    status?: string;
    channel?: string;
    customerId?: string;
    orderType?: string;
    page?: string;
    pageSize?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const skip = (page - 1) * pageSize;
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      status: query.status as OrderStatus | undefined,
      channel: query.channel,
      customerId: query.customerId,
      orderType: query.orderType as OrderType | undefined,
      createdAt:
        query.startDate || query.endDate
          ? {
              gte: query.startDate ? new Date(query.startDate) : undefined,
              lte: query.endDate ? new Date(`${query.endDate}T23:59:59`) : undefined,
            }
          : undefined,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { customer: true, items: true, payments: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, items: { include: { addons: true } }, payments: true, statusLogs: true },
    });
    if (!order || order.deletedAt) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  private mapOrderType(orderType: CreateOrderDto['orderType']): OrderType {
    return {
      delivery: OrderType.DELIVERY,
      counter: OrderType.COUNTER,
      pickup: OrderType.PICKUP,
      table: OrderType.TABLE,
      command: OrderType.COMMAND,
      whatsapp: OrderType.WHATSAPP,
      kiosk: OrderType.KIOSK,
      qr: OrderType.QR,
    }[orderType];
  }

  async create(dto: CreateOrderDto) {
    if (!dto.items.length) throw new BadRequestException('Pedido deve possuir pelo menos um item');
    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: dto.items.map((item) => item.productId) }, deletedAt: null, isActive: true },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));
      let subtotal = new Prisma.Decimal(0);
      const itemsToCreate = dto.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) throw new BadRequestException(`Produto ${item.productId} não encontrado`);
        const unitPrice = new Prisma.Decimal(item.unitPrice ?? product.salePrice);
        const quantity = new Prisma.Decimal(item.quantity);
        const totalPrice = unitPrice.mul(quantity);
        subtotal = subtotal.add(totalPrice);
        return {
          productId: product.id,
          productNameSnapshot: product.name,
          quantity,
          unitPrice,
          costSnapshot: product.costPrice,
          theoreticalCostSnapshot: product.costPrice,
          totalPrice,
          notes: item.notes,
          addons: item.addons?.length
            ? {
                create: item.addons.map((addon) => ({
                  addonItemId: addon.addonItemId,
                  nameSnapshot: 'Adicional',
                  priceSnapshot: new Prisma.Decimal(0),
                  quantity: new Prisma.Decimal(addon.quantity),
                })),
              }
            : undefined,
        };
      });
      const countToday = await tx.order.count();
      const orderNumber = String(countToday + 1).padStart(6, '0');
      const discountAmount = new Prisma.Decimal(0);
      const deliveryFee = new Prisma.Decimal(dto.delivery?.deliveryFee ?? 0);
      const extraFee = new Prisma.Decimal(0);
      const totalAmount = subtotal.sub(discountAmount).add(deliveryFee).add(extraFee);
      return tx.order.create({
        data: {
          companyId: DEFAULT_COMPANY_ID,
          branchId: DEFAULT_BRANCH_ID,
          customerId: dto.customerId,
          tableId: dto.tableId,
          commandId: dto.commandId,
          orderNumber,
          orderType: this.mapOrderType(dto.orderType),
          channel: dto.channel,
          status: OrderStatus.PENDING_CONFIRMATION,
          subtotal,
          discountAmount,
          deliveryFee,
          extraFee,
          totalAmount,
          notes: dto.notes,
          internalNotes: dto.internalNotes,
          items: { create: itemsToCreate },
          payments: dto.payments?.length
            ? {
                create: dto.payments.map((payment) => ({
                  paymentMethod: payment.paymentMethod,
                  amount: new Prisma.Decimal(payment.amount),
                  status: 'paid',
                  transactionReference: payment.transactionReference,
                })),
              }
            : undefined,
          statusLogs: {
            create: { previousStatus: null, newStatus: OrderStatus.PENDING_CONFIRMATION, notes: 'Pedido criado' },
          },
        },
        include: { items: { include: { addons: true } }, payments: true, statusLogs: true },
      });
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const newStatus = dto.status as OrderStatus;
    if (!Object.values(OrderStatus).includes(newStatus)) {
      throw new BadRequestException('Status inválido');
    }
    return this.prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        statusLogs: { create: { previousStatus: order.status, newStatus, notes: dto.notes } },
      },
      include: { statusLogs: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async cancel(id: string, dto: CancelOrderDto) {
    const order = await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELED,
        cancellationReason: dto.reason,
        statusLogs: { create: { previousStatus: order.status, newStatus: OrderStatus.CANCELED, notes: dto.reason } },
      },
    });
  }

  async addPayments(id: string, dto: AddOrderPaymentDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: {
        payments: {
          create: dto.payments.map((payment) => ({
            paymentMethod: payment.paymentMethod,
            amount: new Prisma.Decimal(payment.amount),
            status: 'paid',
            transactionReference: payment.transactionReference,
          })),
        },
      },
      include: { payments: true },
    });
  }
}
