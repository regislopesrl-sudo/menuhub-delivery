import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAccountsPayableDto {
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;
}

