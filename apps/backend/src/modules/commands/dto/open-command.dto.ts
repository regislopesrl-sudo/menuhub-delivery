import { IsOptional, IsUUID } from 'class-validator';

export class OpenCommandDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
