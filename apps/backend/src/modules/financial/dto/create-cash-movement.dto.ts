import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCashMovementDto {
  @IsUUID()
  cashRegisterId!: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsString()
  movementType!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

