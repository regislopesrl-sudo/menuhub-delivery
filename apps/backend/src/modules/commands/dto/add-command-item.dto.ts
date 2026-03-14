import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class AddCommandItemAddonDto {
  @IsUUID()
  addonItemId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

class AddCommandItemLineDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCommandItemAddonDto)
  addons?: AddCommandItemAddonDto[];
}

export class AddCommandItemDto {
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsString()
  @IsIn(['command', 'table'])
  orderType!: 'command' | 'table';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCommandItemLineDto)
  items!: AddCommandItemLineDto[];
}
