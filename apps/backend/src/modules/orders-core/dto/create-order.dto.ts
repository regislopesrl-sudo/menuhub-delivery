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

class CreateOrderCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  phone!: string;
}

class CreateOrderAddressDto {
  @IsString()
  street!: string;

  @IsString()
  number!: string;

  @IsString()
  neighborhood!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

class CreateOrderItemDto {
  @IsString()
  sku!: string;

  @IsNumber()
  @Min(1)
  qty!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateOrderFulfillmentDto {
  @IsIn(['DELIVERY', 'PICKUP'])
  type!: 'DELIVERY' | 'PICKUP';
}

class CreateOrderPaymentDto {
  @IsIn(['PIX', 'CARD', 'CASH'])
  method!: 'PIX' | 'CARD' | 'CASH';
}

export class CreateOrderDto {
  @IsString()
  restaurantId!: string;

  @IsIn(['WEB', 'WHATSAPP', 'COUNTER'])
  channel!: 'WEB' | 'WHATSAPP' | 'COUNTER';

  @ValidateNested()
  @Type(() => CreateOrderCustomerDto)
  customer!: CreateOrderCustomerDto;

  @ValidateNested()
  @Type(() => CreateOrderFulfillmentDto)
  fulfillment!: CreateOrderFulfillmentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  address?: CreateOrderAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ValidateNested()
  @Type(() => CreateOrderPaymentDto)
  payment!: CreateOrderPaymentDto;

  @IsString()
  idempotencyKey!: string;
}
