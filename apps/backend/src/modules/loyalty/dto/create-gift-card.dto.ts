import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGiftCardDto {
  @IsString()
  code!: string;

  @IsNumber()
  @Min(0.01)
  initialBalance!: number;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}
