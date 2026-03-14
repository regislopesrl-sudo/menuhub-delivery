import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePurchaseRequestItemDto } from './create-purchase-request-item.dto';

export class CreatePurchaseRequestDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseRequestItemDto)
  items!: CreatePurchaseRequestItemDto[];
}
