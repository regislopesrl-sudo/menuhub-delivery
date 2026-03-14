import { IsString } from 'class-validator';

export class CheckZipcodeDto {
  @IsString()
  cep!: string;
}
