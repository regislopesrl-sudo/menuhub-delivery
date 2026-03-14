import { IsUUID } from 'class-validator';

export class AssignDeliveryDto {
  @IsUUID()
  orderId!: string;

  @IsUUID()
  courierId!: string;
}
