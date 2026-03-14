import { IsNumber, IsUUID, Min } from 'class-validator';

export class RedeemLoyaltyDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  orderId!: string;

  @IsNumber()
  @Min(1)
  points!: number;
}
