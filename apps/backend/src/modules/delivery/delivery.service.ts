import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeZipCode(zipCode: string) {
    const digits = zipCode.replace(/\D/g, '');
    if (digits.length !== 8) {
      throw new BadRequestException('CEP inválido');
    }
    return digits;
  }

  findAreas(branchId = DEFAULT_BRANCH_ID) {
    return this.prisma.deliveryArea.findMany({
      where: { branchId },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  createArea(dto: CreateDeliveryAreaDto) {
    return this.prisma.deliveryArea.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        name: dto.name,
        zipCodeStart: this.normalizeZipCode(dto.zipCodeStart),
        zipCodeEnd: this.normalizeZipCode(dto.zipCodeEnd),
        deliveryFee: dto.deliveryFee,
        estimatedMinutes: dto.estimatedMinutes,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateArea(id: string, dto: Partial<CreateDeliveryAreaDto>) {
    const area = await this.prisma.deliveryArea.findUnique({ where: { id } });
    if (!area) throw new NotFoundException('Área de entrega não encontrada');

    return this.prisma.deliveryArea.update({
      where: { id },
      data: {
        name: dto.name,
        zipCodeStart: dto.zipCodeStart ? this.normalizeZipCode(dto.zipCodeStart) : undefined,
        zipCodeEnd: dto.zipCodeEnd ? this.normalizeZipCode(dto.zipCodeEnd) : undefined,
        deliveryFee: dto.deliveryFee,
        estimatedMinutes: dto.estimatedMinutes,
        isActive: dto.isActive,
      },
    });
  }

  async lookupZipCode(zipCode: string) {
    const normalized = this.normalizeZipCode(zipCode);
    const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);

    if (!response.ok) {
      throw new BadRequestException('Falha ao consultar CEP');
    }

    const data = (await response.json()) as {
      erro?: boolean;
      cep?: string;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      ibge?: string;
    };

    if (data.erro) {
      throw new NotFoundException('CEP não encontrado');
    }

    return {
      cep: normalized,
      street: data.logradouro ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
      ibgeCode: data.ibge ?? undefined,
    };
  }

  async resolveArea(zipCode: string, branchId = DEFAULT_BRANCH_ID) {
    const normalized = this.normalizeZipCode(zipCode);
    const areas = await this.prisma.deliveryArea.findMany({
      where: { branchId, isActive: true },
      orderBy: { name: 'asc' },
    });

    const area = areas.find(
      (item) => normalized >= item.zipCodeStart && normalized <= item.zipCodeEnd,
    );

    if (!area) {
      return {
        supported: false,
        cep: normalized,
        message: 'CEP fora da área de entrega',
      };
    }

    return {
      supported: true,
      cep: normalized,
      deliveryAreaId: area.id,
      deliveryAreaName: area.name,
      deliveryFee: Number(area.deliveryFee),
      estimatedMinutes: area.estimatedMinutes,
      message: 'Atendemos esta região',
    };
  }

  async checkZipcode(zipCode: string) {
    const normalizedCep = this.normalizeZipCode(zipCode);

    const areas = await this.prisma.deliveryArea.findMany({
      where: { isActive: true },
      orderBy: { zipCodeStart: 'asc' },
    });

    const area = areas.find((item) => {
      return (
        normalizedCep >= item.zipCodeStart.replace(/\D/g, '') &&
        normalizedCep <= item.zipCodeEnd.replace(/\D/g, '')
      );
    });

    if (!area) {
      return {
        supported: false,
        message: 'CEP fora da área de entrega',
      };
    }

    return {
      supported: true,
      deliveryAreaId: area.id,
      deliveryAreaName: area.name,
      deliveryFee: Number(area.deliveryFee),
      estimatedMinutes: area.estimatedMinutes,
    };
  }

  findCouriers() {
    return this.prisma.courier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  createCourier(dto: CreateCourierDto) {
    return this.prisma.courier.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        ...dto,
      },
    });
  }

  async updateCourier(id: string, dto: Partial<CreateCourierDto>) {
    const courier = await this.prisma.courier.findUnique({ where: { id } });
    if (!courier) throw new NotFoundException('Entregador não encontrado');

    return this.prisma.courier.update({
      where: { id },
      data: dto,
    });
  }

  async findCourierDeliveries(courierId: string) {
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
    });

    if (!courier) {
      throw new NotFoundException('Entregador não encontrado');
    }

    return this.prisma.courierDelivery.findMany({
      where: { courierId },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async assign(dto: AssignDeliveryDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    const courier = await this.prisma.courier.findUnique({ where: { id: dto.courierId } });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (!courier) throw new NotFoundException('Entregador não encontrado');

    return this.prisma.courierDelivery.create({
      data: {
        orderId: dto.orderId,
        courierId: dto.courierId,
        assignedAt: new Date(),
      },
    });
  }

  async outForDelivery(id: string) {
    const delivery = await this.prisma.courierDelivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Despacho não encontrado');

    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: {
        status: OrderStatus.OUT_FOR_DELIVERY,
        dispatchedAt: new Date(),
      },
    });

    return this.prisma.courierDelivery.update({
      where: { id },
      data: {
        outForDeliveryAt: new Date(),
      },
    });
  }

  async delivered(id: string) {
    const delivery = await this.prisma.courierDelivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Entrega não encontrada');

    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    return this.prisma.courierDelivery.update({
      where: { id },
      data: {
        deliveredAt: new Date(),
      },
    });
  }

  async fail(id: string) {
    const delivery = await this.prisma.courierDelivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Entrega não encontrada');

    return this.prisma.courierDelivery.update({
      where: { id },
      data: {
        failedAt: new Date(),
        failedReason: 'Falha de entrega',
      },
    });
  }
}
