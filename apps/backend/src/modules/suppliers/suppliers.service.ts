import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  private get supplierDelegate() {
    return (this.prisma as any).supplier;
  }

  async findAll(query: { search?: string; page?: string; pageSize?: string }) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const skip = (page - 1) * pageSize;

    const where = {
      companyId: DEFAULT_COMPANY_ID,
      name: query.search
        ? { contains: query.search, mode: 'insensitive' as const }
        : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.supplierDelegate.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
      this.supplierDelegate.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const supplier = await this.supplierDelegate.findUnique({
      where: {
        id,
      },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        goodsReceipts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!supplier || supplier.companyId !== DEFAULT_COMPANY_ID) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const exists = await this.supplierDelegate.findFirst({
      where: {
        name: dto.name,
        companyId: DEFAULT_COMPANY_ID,
      },
    });

    if (exists) {
      throw new BadRequestException('Fornecedor já cadastrado');
    }

    return this.supplierDelegate.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        name: dto.name,
        document: dto.document,
        phone: dto.phone,
        email: dto.email,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);

    return this.supplierDelegate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const linkedOrders = await (this.prisma as any).purchaseOrder.count({
      where: { supplierId: id },
    });

    if (linkedOrders > 0) {
      throw new BadRequestException('Fornecedor possui compras vinculadas');
    }

    return this.supplierDelegate.delete({
      where: { id },
    });
  }
}
