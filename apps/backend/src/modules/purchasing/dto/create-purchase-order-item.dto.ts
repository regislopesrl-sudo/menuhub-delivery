import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  stockItemId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitCost!: number;
}
