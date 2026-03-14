import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException('Perfil não encontrado');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (exists) throw new BadRequestException('Perfil já cadastrado');
    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds?.length
          ? { create: dto.permissionIds.map((permissionId) => ({ permissionId })) }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.permissionIds) await tx.rolePermission.deleteMany({ where: { roleId: id } });
      return tx.role.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          permissions: dto.permissionIds
            ? { create: dto.permissionIds.map((permissionId) => ({ permissionId })) }
            : undefined,
        },
        include: { permissions: { include: { permission: true } } },
      });
    });
  }
}

