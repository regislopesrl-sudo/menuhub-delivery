import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourierDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  commissionType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionValue?: number;
}
