import { IsOptional, IsString, Matches, IsUUID } from 'class-validator';

export class ResolveDeliveryAreaDto {
  @IsString()
  @Matches(/^\d{8}$/)
  zipCode!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
