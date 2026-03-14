import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateGoodsReceiptItemDto } from './create-goods-receipt-item.dto';

export class CreateGoodsReceiptDto {
  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;

  @IsUUID()
  supplierId!: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  invoiceKey?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptItemDto)
  items!: CreateGoodsReceiptItemDto[];
}
