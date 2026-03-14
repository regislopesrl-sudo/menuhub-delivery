import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

