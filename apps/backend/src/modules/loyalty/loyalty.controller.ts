import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { LoyaltyService } from './loyalty.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { RedeemLoyaltyDto } from './dto/redeem-loyalty.dto';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('coupons')
  @RequirePermission('loyalty.view')
  findCoupons() {
    return this.loyaltyService.findCoupons();
  }

  @Post('coupons')
  @RequirePermission('loyalty.create_coupon')
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.loyaltyService.createCoupon(dto);
  }

  @Patch('coupons/:id')
  @RequirePermission('loyalty.update_coupon')
  updateCoupon(@Param('id') id: string, @Body() dto: Partial<CreateCouponDto>) {
    return this.loyaltyService.updateCoupon(id, dto);
  }

  @Get('customers/:id')
  @RequirePermission('loyalty.view')
  getCustomerLoyalty(@Param('id') id: string) {
    return this.loyaltyService.getCustomerLoyalty(id);
  }

  @Post('redeem')
  @RequirePermission('loyalty.redeem')
  redeem(@Body() dto: RedeemLoyaltyDto) {
    return this.loyaltyService.redeem(dto);
  }

  @Get('giftcards')
  @RequirePermission('loyalty.manage_giftcards')
  findGiftCards() {
    return this.loyaltyService.findGiftCards();
  }

  @Post('giftcards')
  @RequirePermission('loyalty.manage_giftcards')
  createGiftCard(@Body() dto: CreateGiftCardDto) {
    return this.loyaltyService.createGiftCard(dto);
  }
}
