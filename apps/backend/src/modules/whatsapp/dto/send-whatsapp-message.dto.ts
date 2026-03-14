import { IsIn, IsOptional, IsString } from 'class-validator';

export class SendWhatsappMessageDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  @IsIn(['text', 'image', 'template'])
  messageType?: 'text' | 'image' | 'template';
}
