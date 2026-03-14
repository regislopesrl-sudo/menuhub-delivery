import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAccountsReceivableDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

