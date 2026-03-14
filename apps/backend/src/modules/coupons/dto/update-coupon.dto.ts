import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  perCustomerLimit?: number;

  @IsOptional()
  @IsString()
  startsAt?: string;

  @IsOptional()
  @IsString()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  firstOrderOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
