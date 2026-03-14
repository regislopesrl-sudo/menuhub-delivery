import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: { search?: string; isActive?: string }) {
    return this.prisma.category.findMany({
      where: {
        name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
        isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }
}
