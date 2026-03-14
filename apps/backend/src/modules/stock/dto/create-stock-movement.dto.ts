import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStockMovementDto {
  @IsUUID()
  stockItemId!: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsString()
  movementType!: string;

  @IsOptional()
  @IsString()
  movementTypeDetailed?: string;

  @IsOptional()
  @IsString()
  sourceModule?: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  reasonCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

