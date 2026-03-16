import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    search?: string;
    isVip?: string;
    isBlocked?: string;
    page?: string;
    pageSize?: string;
  }) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const skip = (page - 1) * pageSize;
    const where = {
      deletedAt: null,
      isVip: query.isVip !== undefined ? query.isVip === 'true' : undefined,
      isBlocked: query.isBlocked !== undefined ? query.isBlocked === 'true' : undefined,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { phone: { contains: query.search, mode: 'insensitive' as const } },
            { whatsapp: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ]
        : undefined,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: { addresses: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { addresses: true, orders: true },
    });
    if (!customer || customer.deletedAt) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        name: dto.name,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        cpfCnpj: dto.cpfCnpj,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        notes: dto.notes,
        isVip: dto.isVip ?? false,
        addresses: dto.addresses?.length
          ? {
              create: dto.addresses.map((address) => ({
                label: address.label,
                zipCode: address.zipCode,
                street: address.street,
                number: address.number,
                complement: address.complement,
                district: address.district,
                city: address.city,
                state: address.state,
                reference: address.reference,
                latitude: address.latitude,
                longitude: address.longitude,
                isDefault: address.isDefault ?? false,
              })),
            }
          : undefined,
      },
      include: { addresses: true },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        cpfCnpj: dto.cpfCnpj,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        notes: dto.notes,
        isVip: dto.isVip,
        isBlocked: dto.isBlocked,
        addresses: dto.addresses
          ? {
              deleteMany: {},
              create: dto.addresses.map((address) => ({
                label: address.label,
                zipCode: address.zipCode,
                street: address.street,
                number: address.number,
                complement: address.complement,
                district: address.district,
                city: address.city,
                state: address.state,
                reference: address.reference,
                latitude: address.latitude,
                longitude: address.longitude,
                isDefault: address.isDefault ?? false,
              })),
            }
          : undefined,
      },
      include: { addresses: true },
    });
  }

  async getOrders(id: string) {
    await this.findOne(id);
    return this.prisma.order.findMany({
      where: { customerId: id, deletedAt: null },
      include: { items: { include: { addons: true } }, payments: true, statusLogs: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async autocompleteByContact(q: string) {
    if (!q?.trim()) return [];

    const normalized = q.trim();

    return this.prisma.customer.findMany({
      where: {
        deletedAt: null,
        OR: [
          { phone: { contains: normalized, mode: 'insensitive' as const } },
          { whatsapp: { contains: normalized, mode: 'insensitive' as const } },
          { name: { contains: normalized, mode: 'insensitive' as const } },
        ],
      },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
      take: 10,
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isBlocked: true,
      },
    });
  }
}
