import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateReservationDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsString()
  guestName!: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsInt()
  @Min(1)
  guestCount!: number;

  @IsString()
  reservationAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
