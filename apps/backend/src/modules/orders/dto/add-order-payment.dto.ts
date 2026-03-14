import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateOrderPaymentDto } from './create-order.dto';

export class AddOrderPaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPaymentDto)
  payments!: CreateOrderPaymentDto[];
}

