import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesPeriod(query: { start?: string; end?: string }) {
    const start = query.start
      ? new Date(query.start)
      : new Date(new Date().setDate(new Date().getDate() - 6));
    const end = query.end ? new Date(`${query.end}T23:59:59`) : new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          not: 'CANCELED' as any,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const map = new Map<string, number>();

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + Number(order.totalAmount ?? 0));
    }

    return Array.from(map.entries()).map(([date, total]) => ({
      date,
      total,
    }));
  }

  async getOrdersReport(query: { start?: string; end?: string }) {
    const where = {
      createdAt: {
        gte: query.start ? new Date(query.start) : undefined,
        lte: query.end ? new Date(query.end) : undefined,
      },
    };

    const [orders, totalSales] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { customer: true, items: true, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.aggregate({
        where,
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    return {
      totalOrders: totalSales._count,
      totalSales: Number(totalSales._sum.totalAmount ?? 0),
      orders,
    };
  }

  async getFinancialReport(query: { start?: string; end?: string }) {
    const dateFilter = {
      gte: query.start ? new Date(query.start) : undefined,
      lte: query.end ? new Date(query.end) : undefined,
    };

    const [receivable, payable, cashMovements] = await Promise.all([
      this.prisma.accountsReceivable.aggregate({
        where: { createdAt: dateFilter as any },
        _sum: { amount: true },
      }),
      this.prisma.accountsPayable.aggregate({
        where: { createdAt: dateFilter as any },
        _sum: { amount: true },
      }),
      this.prisma.cashMovement.findMany({
        where: { createdAt: dateFilter as any },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      receivable: Number(receivable._sum.amount ?? 0),
      payable: Number(payable._sum.amount ?? 0),
      cashMovements,
    };
  }

  async getStockReport(query: { search?: string }) {
    const items = await this.prisma.stockItem.findMany({
      where: {
        name: query.search
          ? { contains: query.search, mode: 'insensitive' }
          : undefined,
      },
      include: {
        batches: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      totalItems: items.length,
      lowStock: items.filter(
        (item) => Number(item.currentQuantity) <= Number(item.minimumQuantity),
      ),
      items,
    };
  }

  async getDeliveryReport(_query?: Record<string, never>) {
    const deliveries = await this.prisma.courierDelivery.findMany({
      include: {
        order: true,
        courier: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return {
      totalDeliveries: deliveries.length,
      delivered: deliveries.filter((d) => !!d.deliveredAt).length,
      failed: deliveries.filter((d) => !!d.failedAt).length,
      deliveries,
    };
  }

  async getCrmReport(_query?: Record<string, never>) {
    const [customers, vipCustomers, loyaltyTransactions] = await Promise.all([
      this.prisma.customer.count({
        where: { deletedAt: null },
      }),
      this.prisma.customer.count({
        where: { isVip: true, deletedAt: null },
      }),
      this.prisma.loyaltyTransaction.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalCustomers: customers,
      vipCustomers,
      loyaltyTransactions,
    };
  }

  async getWhatsappReport(_query?: Record<string, never>) {
    const [conversations, messages] = await Promise.all([
      this.prisma.whatsappConversation.findMany({
        include: {
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.whatsappMessage.count(),
    ]);

    return {
      totalConversations: conversations.length,
      totalMessages: messages,
      conversations,
    };
  }
}
