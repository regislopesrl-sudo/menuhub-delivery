import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePurchaseRequestItemDto {
  @IsUUID()
  stockItemId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
