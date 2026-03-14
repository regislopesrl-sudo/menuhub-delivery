import { IsOptional, IsString } from 'class-validator';

export class HandleReviewDto {
  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  handledById?: string;
}
