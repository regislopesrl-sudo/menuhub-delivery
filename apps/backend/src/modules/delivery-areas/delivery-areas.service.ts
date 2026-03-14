import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';
import { UpdateDeliveryAreaDto } from './dto/update-delivery-area.dto';

@Injectable()
export class DeliveryAreasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: { search?: string }) {
    return this.prisma.deliveryArea.findMany({
      where: {
        name: query.search
          ? { contains: query.search, mode: 'insensitive' }
          : undefined,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const area = await this.prisma.deliveryArea.findUnique({ where: { id } });
    if (!area) throw new NotFoundException('Área de entrega não encontrada');
    return area;
  }

  create(dto: CreateDeliveryAreaDto) {
    return this.prisma.deliveryArea.create({
      data: {
        branchId: '00000000-0000-0000-0000-000000000001',
        name: dto.name,
        zipCodeStart: dto.zipCodeStart.replace(/\D/g, ''),
        zipCodeEnd: dto.zipCodeEnd.replace(/\D/g, ''),
        deliveryFee: dto.deliveryFee,
        estimatedMinutes: dto.estimatedMinutes,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateDeliveryAreaDto) {
    await this.findOne(id);
    return this.prisma.deliveryArea.update({
      where: { id },
      data: {
        name: dto.name,
        zipCodeStart: dto.zipCodeStart?.replace(/\D/g, ''),
        zipCodeEnd: dto.zipCodeEnd?.replace(/\D/g, ''),
        deliveryFee: dto.deliveryFee,
        estimatedMinutes: dto.estimatedMinutes,
        isActive: dto.isActive,
      },
    });
  }

  async checkZipcode(cep: string) {
    const normalized = cep.replace(/\D/g, '');
    if (normalized.length !== 8) {
      throw new BadRequestException('CEP inválido');
    }

    const areas = await this.prisma.deliveryArea.findMany({
      where: { isActive: true },
      orderBy: { zipCodeStart: 'asc' },
    });

    const area = areas.find((item) => {
      const start = item.zipCodeStart.replace(/\D/g, '');
      const end = item.zipCodeEnd.replace(/\D/g, '');
      return normalized >= start && normalized <= end;
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
}
