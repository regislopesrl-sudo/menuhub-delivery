import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class OpenTableDto {
  @IsUUID()
  tableId!: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  guestCount?: number;
}
