import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTableDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  qrCode?: string;
}
