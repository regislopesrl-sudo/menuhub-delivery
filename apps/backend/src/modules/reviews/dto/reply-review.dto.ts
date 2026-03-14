import { IsString } from 'class-validator';

export class ReplyReviewDto {
  @IsString()
  responseText!: string;
}
