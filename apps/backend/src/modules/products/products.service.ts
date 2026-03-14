import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    categoryId?: string;
    isActive?: string;
    search?: string;
    page?: string;
    pageSize?: string;
  }) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const skip = (page - 1) * pageSize;
    const where = {
      deletedAt: null,
      categoryId: query.categoryId,
      isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      name: query.search ? { contains: query.search, mode: 'insensitive' as const } : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true, addonLinks: { include: { addonGroup: true } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, addonLinks: { include: { addonGroup: true } } },
    });
    if (!product || product.deletedAt) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        salePrice: dto.salePrice,
        promotionalPrice: dto.promotionalPrice,
        costPrice: dto.costPrice ?? 0,
        prepTimeMinutes: dto.prepTimeMinutes ?? 0,
        imageUrl: dto.imageUrl,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        controlsStock: dto.controlsStock ?? false,
        allowNotes: dto.allowNotes ?? true,
        availableDelivery: dto.availableDelivery ?? true,
        availableCounter: dto.availableCounter ?? true,
        availableTable: dto.availableTable ?? true,
        sortOrder: dto.sortOrder ?? 0,
        addonLinks: dto.addonGroupIds?.length
          ? { create: dto.addonGroupIds.map((addonGroupId) => ({ addonGroupId })) }
          : undefined,
      },
      include: { addonLinks: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.addonGroupIds) {
        await tx.productAddonGroup.deleteMany({ where: { productId: id } });
      }
      return tx.product.update({
        where: { id },
        data: {
          ...dto,
          addonLinks: dto.addonGroupIds
            ? { create: dto.addonGroupIds.map((addonGroupId) => ({ addonGroupId })) }
            : undefined,
        },
        include: { addonLinks: { include: { addonGroup: true } } },
      });
    });
  }

  async toggle(id: string) {
    const product = await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
