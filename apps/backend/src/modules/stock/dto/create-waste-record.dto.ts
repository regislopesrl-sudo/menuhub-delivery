import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateWasteRecordDto {
  @IsUUID()
  stockItemId!: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

