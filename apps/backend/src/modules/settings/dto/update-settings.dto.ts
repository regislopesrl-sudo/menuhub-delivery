import { IsArray, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SettingItemDto {
  @IsString()
  key!: string;

  @IsObject()
  value!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class UpdateSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  items!: SettingItemDto[];
}
