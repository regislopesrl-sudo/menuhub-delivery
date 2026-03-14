export class UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleIds?: string[];
  isActive?: boolean;
}
