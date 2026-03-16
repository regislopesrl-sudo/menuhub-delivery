import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { CreateAccountsReceivableDto } from './dto/create-accounts-receivable.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';

@Injectable()
export class FinancialService {
  constructor(private readonly prisma: PrismaService) {}

  findCashRegisters() {
    return this.prisma.cashRegister.findMany({
      orderBy: { openedAt: 'desc' },
    });
  }

  async openCashRegister(dto: OpenCashRegisterDto) {
    const opened = await this.prisma.cashRegister.findFirst({
      where: {
        branchId: DEFAULT_BRANCH_ID,
        status: 'open',
      },
    });

    if (opened) throw new BadRequestException('Já existe caixa aberto');

    return this.prisma.cashRegister.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        openingBalance: dto.openingBalance,
        status: 'open',
      },
    });
  }

  async closeCashRegister(id: string, dto: CloseCashRegisterDto) {
    const register = await this.prisma.cashRegister.findUnique({ where: { id } });
    if (!register) throw new NotFoundException('Caixa não encontrado');
    if (register.status !== 'open') throw new BadRequestException('Caixa já fechado');

    return this.prisma.cashRegister.update({
      where: { id },
      data: {
        closingBalance: dto.closingBalance,
        closedAt: new Date(),
        status: 'closed',
      },
    });
  }

  createCashMovement(dto: CreateCashMovementDto) {
    return this.prisma.cashMovement.create({
      data: {
        cashRegisterId: dto.cashRegisterId,
        orderId: dto.orderId,
        movementType: dto.movementType,
        category: dto.category,
        amount: dto.amount,
        notes: dto.notes,
      },
    });
  }

  findAccountsPayable() {
    return this.prisma.accountsPayable.findMany({
      include: { supplier: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  createAccountsPayable(dto: CreateAccountsPayableDto) {
    return this.prisma.accountsPayable.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        supplierId: dto.supplierId,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        purchaseOrderId: dto.purchaseOrderId,
        status: 'pending',
      },
    });
  }

  findAccountsReceivable() {
    return this.prisma.accountsReceivable.findMany({
      include: {
        customer: true,
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createAccountsReceivable(dto: CreateAccountsReceivableDto) {
    return this.prisma.accountsReceivable.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        customerId: dto.customerId,
        orderId: dto.orderId,
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: 'pending',
      },
    });
  }

  async getDashboard(query?: { start?: string; end?: string }) {
    const start = query?.start
      ? new Date(query.start)
      : new Date(new Date().setHours(0, 0, 0, 0));
    const end = query?.end ? new Date(`${query.end}T23:59:59`) : new Date();

    const [
      orders,
      receivablesPending,
      payablesPending,
      openCashRegister,
      receivablesInPeriod,
      payablesInPeriod,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: 'CANCELED' as any },
        },
      }),
      this.prisma.accountsReceivable.aggregate({
        _sum: { amount: true },
        where: { status: 'pending' },
      }),
      this.prisma.accountsPayable.aggregate({
        _sum: { amount: true },
        where: { status: 'pending' },
      }),
      this.prisma.cashRegister.findFirst({
        where: { status: 'open' },
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.accountsReceivable.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
      this.prisma.accountsPayable.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    return {
      salesToday: Number(orders._sum.totalAmount ?? 0),
      receivablesPending: Number(receivablesPending._sum.amount ?? 0),
      payablesPending: Number(payablesPending._sum.amount ?? 0),
      receivablesInPeriod: Number(receivablesInPeriod._sum.amount ?? 0),
      payablesInPeriod: Number(payablesInPeriod._sum.amount ?? 0),
      openCashRegister,
    };
  }
}
