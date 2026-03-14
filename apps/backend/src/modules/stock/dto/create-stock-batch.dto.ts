import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStockBatchDto {
  @IsUUID()
  stockItemId!: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  manufactureDate?: string;

  @IsOptional()
  @IsString()
  receivedDate?: string;

  @IsOptional()
  @IsString()
  openedDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  useUntilDate?: string;

  @IsNumber()
  @Min(0.001)
  initialQuantity!: number;

  @IsNumber()
  @Min(0)
  unitCost!: number;

  @IsOptional()
  @IsString()
  sanitaryNotes?: string;
}

