import { Injectable } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';

type MenuItem = {
  sku: string;
  name: string;
  price: number;
  aliases: string[];
  active: boolean;
  productId?: string;
  comboId?: string;
  type: 'PRODUCT' | 'COMBO';
};

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeSku(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private buildAliases(name: string, sku: string) {
    const aliases = new Set<string>([
      name.trim().toLowerCase(),
      sku,
      sku.replace(/_/g, ' '),
    ]);
    const simplified = name
      .trim()
      .toLowerCase()
      .replace(/^pastel de /, '')
      .replace(/^combo /, '')
      .trim();

    if (simplified) aliases.add(simplified);

    return Array.from(aliases);
  }

  async getMenu(restaurantId: string) {
    void restaurantId;
    const [products, combos] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { companyId: DEFAULT_COMPANY_ID, deletedAt: null, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.combo.findMany({
        where: { companyId: DEFAULT_COMPANY_ID, isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return [
      ...products.map((product) => {
        const sku = this.normalizeSku(product.sku ?? product.name);
        return {
          sku,
          name: product.name,
          price: Number(product.promotionalPrice ?? product.salePrice),
          aliases: this.buildAliases(product.name, sku),
          active: product.isActive,
          productId: product.id,
          type: 'PRODUCT' as const,
        };
      }),
      ...combos.map((combo) => {
        const sku = this.normalizeSku(combo.name);
        return {
          sku,
          name: combo.name,
          price: Number(combo.price),
          aliases: this.buildAliases(combo.name, sku),
          active: combo.isActive,
          comboId: combo.id,
          type: 'COMBO' as const,
        };
      }),
    ];
  }

  async findBySku(restaurantId: string, sku: string) {
    const normalizedSku = this.normalizeSku(sku);
    return (await this.getMenu(restaurantId)).find((i) => i.sku === normalizedSku);
  }

  async findByText(restaurantId: string, raw: string) {
    const text = raw.trim().toLowerCase();
    return (await this.getMenu(restaurantId)).find((item) =>
      item.aliases.some((alias) => text.includes(alias.toLowerCase())),
    );
  }
}
