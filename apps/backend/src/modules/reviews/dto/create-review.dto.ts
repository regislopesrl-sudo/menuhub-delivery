import { IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  authorContact?: string;

  @IsOptional()
  @IsString()
  sentiment?: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsOptional()
  @IsString()
  reviewAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
