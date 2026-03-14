import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  roleIds!: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

