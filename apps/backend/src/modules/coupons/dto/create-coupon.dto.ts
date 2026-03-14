import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsString()
  discountType!: string;

  @IsNumber()
  @Min(0)
  discountValue!: number;

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
}
