import { Injectable, NotFoundException } from '@nestjs/common';
import { TableStatus } from '@prisma/client';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { OpenTableDto } from './dto/open-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  private get tableDelegate() {
    return (this.prisma as any).tableRestaurant;
  }

  findAll() {
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
}
