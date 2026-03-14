import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class QuoteItemDto {
  @IsString()
  sku!: string;

  @IsNumber()
  @Min(1)
  qty!: number;
}

class QuoteFulfillmentDto {
  @IsIn(['DELIVERY', 'PICKUP'])
  type!: 'DELIVERY' | 'PICKUP';

  @IsOptional()
  @IsString()
  neighborhood?: string;
}

export class QuoteOrderDto {
  @IsString()
  restaurantId!: string;

  @ValidateNested()
  @Type(() => QuoteFulfillmentDto)
  fulfillment!: QuoteFulfillmentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items!: QuoteItemDto[];
}
