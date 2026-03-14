import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';

@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  private get comboDelegate() {
    return (this.prisma as any).combo;
  }

  findAll() {
    return this.comboDelegate.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const combo = await this.comboDelegate.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!combo || combo.companyId !== DEFAULT_COMPANY_ID) {
      throw new NotFoundException('Combo não encontrado');
    }

    return combo;
  }

  create(dto: CreateComboDto) {
    return this.comboDelegate.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isActive: dto.isActive ?? true,
        items: dto.items?.length
          ? {
              create: dto.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity ?? 1,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateComboDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await (tx as any).comboItem.deleteMany({
          where: { comboId: id },
        });
      }

      return (tx as any).combo.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          isActive: dto.isActive,
          items: dto.items
            ? {
                create: dto.items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity ?? 1,
                })),
              }
            : undefined,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }
}
