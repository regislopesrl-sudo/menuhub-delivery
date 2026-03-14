import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateProductionOrderDto {
  @IsUUID()
  stockItemId!: string;

  @IsNumber()
  @Min(0.001)
  plannedQuantity!: number;
}
