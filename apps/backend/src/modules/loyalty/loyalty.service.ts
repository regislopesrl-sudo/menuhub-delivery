import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { RedeemLoyaltyDto } from './dto/redeem-loyalty.dto';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  findCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  createCoupon(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
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

  async updateCoupon(id: string, dto: Partial<CreateCouponDto>) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupom não encontrado');

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });
  }

  async getCustomerLoyalty(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');

    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
    });

    const balance = transactions.reduce((acc, item) => acc + item.points, 0);

    return {
      customerId: id,
      balance,
      transactions,
    };
  }

  async redeem(dto: RedeemLoyaltyDto) {
    const loyalty = await this.getCustomerLoyalty(dto.customerId);

    if (loyalty.balance < dto.points) {
      throw new BadRequestException('Saldo insuficiente de pontos');
    }

    return this.prisma.loyaltyTransaction.create({
      data: {
        customerId: dto.customerId,
        orderId: dto.orderId,
        transactionType: 'redeem',
        points: dto.points * -1,
        description: 'Resgate de fidelidade',
      },
    });
  }

  findGiftCards() {
    return this.prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  createGiftCard(dto: CreateGiftCardDto) {
    return this.prisma.giftCard.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        code: dto.code,
        initialBalance: dto.initialBalance,
        currentBalance: dto.initialBalance,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: true,
      },
    });
  }
}
