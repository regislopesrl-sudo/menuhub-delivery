import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateGoodsReceiptItemDto {
  @IsUUID()
  stockItemId!: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  orderedQuantity?: number;

  @IsNumber()
  @Min(0.001)
  receivedQuantity!: number;

  @IsNumber()
  @Min(0)
  unitCost!: number;

  @IsOptional()
  @IsBoolean()
  hasDivergence?: boolean;

  @IsOptional()
  @IsString()
  divergenceNotes?: string;
}
