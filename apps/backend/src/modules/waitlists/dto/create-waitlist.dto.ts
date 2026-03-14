import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateWaitlistDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  guestName!: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsInt()
  @Min(1)
  guestCount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
