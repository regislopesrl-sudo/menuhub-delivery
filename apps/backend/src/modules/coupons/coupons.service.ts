import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  private get couponDelegate() {
    return (this.prisma as any).coupon;
  }

  findAll() {
    return this.couponDelegate.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.couponDelegate.findUnique({
      where: { id },
    });

    if (!coupon || coupon.companyId !== DEFAULT_COMPANY_ID) {
      throw new NotFoundException('Cupom não encontrado');
    }

    return coupon;
  }

  create(dto: CreateCouponDto) {
    return this.couponDelegate.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        code: dto.code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minimumOrderAmount: dto.minimumOrderAmount,
        maxUses: dto.maxUses,
        perCustomerLimit: dto.perCustomerLimit,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        firstOrderOnly: dto.firstOrderOnly ?? false,
        isActive: true,
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);

    return this.couponDelegate.update({
      where: { id },
      data: {
        code: dto.code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minimumOrderAmount: dto.minimumOrderAmount,
        maxUses: dto.maxUses,
        perCustomerLimit: dto.perCustomerLimit,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        firstOrderOnly: dto.firstOrderOnly,
        isActive: dto.isActive,
      },
    });
  }
}
