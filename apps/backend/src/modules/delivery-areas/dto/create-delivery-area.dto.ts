import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryAreaDto {
  @IsString()
  name!: string;

  @IsString()
  zipCodeStart!: string;

  @IsString()
  zipCodeEnd!: string;

  @IsNumber()
  deliveryFee!: number;

  @IsNumber()
  estimatedMinutes!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
