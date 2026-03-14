import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateAddonGroupDto } from './dto/create-addon-group.dto';
import { UpdateAddonGroupDto } from './dto/update-addon-group.dto';

@Injectable()
export class AddonsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.addonGroup.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      include: {
        items: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        productLinks: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const addonGroup = await this.prisma.addonGroup.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        productLinks: true,
      },
    });

    if (!addonGroup || addonGroup.companyId !== DEFAULT_COMPANY_ID) {
      throw new NotFoundException('Grupo de adicional não encontrado');
    }

    return addonGroup;
  }

  create(dto: CreateAddonGroupDto) {
    return this.prisma.addonGroup.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        name: dto.name,
        minSelect: dto.minSelect ?? 0,
        maxSelect: dto.maxSelect ?? 1,
        required: dto.required ?? false,
        allowMultiple: dto.allowMultiple ?? false,
        items: dto.items?.length
          ? {
              create: dto.items.map((item) => ({
                name: item.name,
                price: item.price,
                sortOrder: item.sortOrder ?? 0,
                isActive: item.isActive ?? true,
              })),
            }
          : undefined,
      },
      include: {
        items: true,
      },
    });
  }

  async update(id: string, dto: UpdateAddonGroupDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.addonItem.deleteMany({
          where: { groupId: id },
        });
      }

      return tx.addonGroup.update({
        where: { id },
        data: {
          name: dto.name,
          minSelect: dto.minSelect,
          maxSelect: dto.maxSelect,
          required: dto.required,
          allowMultiple: dto.allowMultiple,
          items: dto.items
            ? {
                create: dto.items.map((item) => ({
                  name: item.name ?? 'Item',
                  price: item.price ?? 0,
                  sortOrder: item.sortOrder ?? 0,
                  isActive: item.isActive ?? true,
                })),
              }
            : undefined,
        },
        include: {
          items: {
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          },
        },
      });
    });
  }
}
