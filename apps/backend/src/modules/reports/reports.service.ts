import { Injectable } from '@nestjs/common';
import { TableStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';

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

  async getDeliveryDashboard(query: { start?: string; end?: string }) {
    const start = query.start
      ? new Date(query.start)
      : new Date(new Date().setDate(new Date().getDate() - 6));
    const end = query.end ? new Date(`${query.end}T23:59:59`) : new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        orderType: 'DELIVERY' as any,
        createdAt: {
          gte: start,
          lte: end,
        },
        deletedAt: null,
      },
      include: {
        deliveryArea: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const byAreaMap = new Map<string, { area: string; count: number; total: number }>();
    let totalMinutes = 0;
    let completed = 0;

    for (const order of orders) {
      const areaName = order.deliveryArea?.name ?? 'Sem área';
      const current = byAreaMap.get(areaName) ?? { area: areaName, count: 0, total: 0 };
      current.count += 1;
      current.total += Number(order.totalAmount ?? 0);
      byAreaMap.set(areaName, current);

      if (order.dispatchedAt && order.deliveredAt) {
        const diff =
          (new Date(order.deliveredAt).getTime() - new Date(order.dispatchedAt).getTime()) /
          60000;
        totalMinutes += diff;
        completed += 1;
      }
    }

    return {
      totalDeliveryOrders: orders.length,
      averageDeliveryMinutes: completed
        ? Number((totalMinutes / completed).toFixed(2))
        : 0,
      byArea: Array.from(byAreaMap.values()),
    };
  }

  async getOperationsDashboard() {
    const [kitchenOrders, counterOrders, readyOrders, delayedOrders] = await Promise.all([
      this.prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'IN_PREPARATION'] as any },
          orderType: { in: ['DELIVERY', 'PICKUP', 'TABLE', 'COMMAND'] as any },
          deletedAt: null,
        },
      }),
      this.prisma.order.count({
        where: {
          orderType: { in: ['COUNTER', 'PICKUP'] as any },
          deletedAt: null,
        },
      }),
      this.prisma.order.count({
        where: {
          status: 'READY' as any,
          deletedAt: null,
        },
      }),
      this.prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'IN_PREPARATION'] as any },
          createdAt: {
            lte: new Date(Date.now() - 30 * 60 * 1000),
          },
          deletedAt: null,
        },
      }),
    ]);

    return {
      kitchenQueue: kitchenOrders,
      counterQueue: counterOrders,
      readyOrders,
      delayedOrders,
    };
  }

  async getSalonDashboard() {
    const branchId = DEFAULT_BRANCH_ID;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const [tables, openCommands, openOrders, readyOrders] = await Promise.all([
      this.prisma.tableRestaurant.findMany({
        orderBy: { name: 'asc' },
      }),
      this.prisma.command.count({
        where: { status: 'open' },
      }),
      this.prisma.order.count({
        where: {
          deletedAt: null,
          orderType: { in: ['TABLE', 'COMMAND'] as any },
          status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PREPARATION'] as any },
        },
      }),
      this.prisma.order.count({
        where: {
          deletedAt: null,
          orderType: { in: ['TABLE', 'COMMAND'] as any },
          status: 'READY' as any,
        },
      }),
    ]);

    return {
      totalTables: tables.length,
      occupiedTables: tables.filter((table) => table.status === 'OCCUPIED').length,
      freeTables: tables.filter((table) => table.status === 'FREE').length,
      openCommands,
      openOrders,
      readyOrders,
      tables,
    };
  }
}
