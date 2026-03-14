import { IsBoolean, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateDeliveryAreaDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(/^\d{8}$/)
  zipCodeStart!: string;

  @IsString()
  @Matches(/^\d{8}$/)
  zipCodeEnd!: string;

  @IsNumber()
  @Min(0)
  deliveryFee!: number;

  @IsNumber()
  @Min(0)
  estimatedMinutes!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
