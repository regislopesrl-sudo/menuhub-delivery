import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '@/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: { search?: string }) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: query.search
          ? [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { roles: { include: { role: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!user || user.deletedAt) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('E-mail já cadastrado');
    const passwordHash = await hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        isActive: dto.isActive ?? true,
        roles: { create: dto.roleIds.map((roleId) => ({ roleId })) },
      },
      include: { roles: { include: { role: true } } },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.roleIds) await tx.userRole.deleteMany({ where: { userId: id } });
      return tx.user.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          isActive: dto.isActive,
          roles: dto.roleIds
            ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
            : undefined,
        },
        include: { roles: { include: { role: true } } },
      });
    });
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
