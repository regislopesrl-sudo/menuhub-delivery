import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStockItemDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  purchaseUnit?: string;

  @IsOptional()
  @IsString()
  stockUnit?: string;

  @IsOptional()
  @IsString()
  productionUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  conversionFactor?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lastCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  standardCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @IsOptional()
  @IsBoolean()
  controlsBatch?: boolean;

  @IsOptional()
  @IsBoolean()
  controlsExpiry?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresFefo?: boolean;

  @IsOptional()
  @IsBoolean()
  isPerishable?: boolean;

  @IsOptional()
  @IsBoolean()
  isFractionable?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsBoolean()
  isHighTurnover?: boolean;
}

