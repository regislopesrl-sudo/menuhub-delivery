import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsUUID()
  deliveryAreaId?: string;

  @IsString()
  street!: string;

  @IsString()
  number!: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  district!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  ibgeCode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
