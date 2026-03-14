import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  @Min(0)
  salePrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prepTimeMinutes?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  controlsStock?: boolean;

  @IsOptional()
  @IsBoolean()
  allowNotes?: boolean;

  @IsOptional()
  @IsBoolean()
  availableDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  availableCounter?: boolean;

  @IsOptional()
  @IsBoolean()
  availableTable?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  addonGroupIds?: string[];
}

