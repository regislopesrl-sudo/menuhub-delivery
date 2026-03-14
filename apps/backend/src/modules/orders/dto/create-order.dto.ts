import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemAddonDto {
  @IsUUID()
  addonItemId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderItemDto {
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
  @Type(() => CreateOrderItemAddonDto)
  addons?: CreateOrderItemAddonDto[];
}

export class CreateOrderPaymentDto {
  @IsString()
  paymentMethod!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  transactionReference?: string;
}

export class CreateOrderDeliveryDto {
  @IsUUID()
  customerAddressId!: string;

  @IsOptional()
  @IsUUID()
  deliveryAreaId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsOptional()
  @IsUUID()
  commandId?: string;

  @IsString()
  @IsIn(['delivery', 'counter', 'pickup', 'table', 'command', 'whatsapp', 'kiosk', 'qr'])
  orderType!: 'delivery' | 'counter' | 'pickup' | 'table' | 'command' | 'whatsapp' | 'kiosk' | 'qr';

  @IsString()
  channel!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loyaltyPointsToUse?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateOrderDeliveryDto)
  delivery?: CreateOrderDeliveryDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPaymentDto)
  payments?: CreateOrderPaymentDto[];
}
