import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async buildUserContext(user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    roles: Array<{
      role: {
        name: string;
        permissions: Array<{ permission: { code: string } }>;
      };
    }>;
  }) {
    const roles = user.roles.map((entry) => entry.role.name);
    const permissions = Array.from(
      new Set(
        user.roles.flatMap((entry) =>
          entry.role.permissions.map((permission) => permission.permission.code),
        ),
      ),
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles,
      permissions,
    };
  }

  private async issueTokens(user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    roles: Array<{
      role: {
        name: string;
        permissions: Array<{ permission: { code: string } }>;
      };
    }>;
  }) {
    const userContext = await this.buildUserContext(user);
    const payload = {
      sub: user.id,
      email: user.email,
      roles: userContext.roles,
      permissions: userContext.permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
      jwtid: randomUUID(),
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    const decodedRefresh = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await hash(refreshToken, 10),
        expiresAt: new Date(decodedRefresh.exp * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: userContext,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null, isActive: true },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const validPassword = await compare(dto.password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedException('Credenciais inválidas');

    const result = await this.issueTokens(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return result;
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
          refreshTokens: {
            where: {
              revokedAt: null,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('Usuário inválido');
      }

      const refreshTokenRecord = await Promise.any(
        user.refreshTokens.map(async (record) => {
          const matches = await compare(dto.refreshToken, record.tokenHash);
          if (!matches) {
            throw new Error('not-matched');
          }
          return record;
        }),
      ).catch(() => null);

      if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      await this.prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { revokedAt: new Date() },
      });

      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(dto: RefreshTokenDto) {
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    for (const token of activeTokens) {
      const matches = await compare(dto.refreshToken, token.tokenHash);
      if (!matches) {
        continue;
      }

      await this.prisma.refreshToken.update({
        where: { id: token.id },
        data: { revokedAt: new Date() },
      });

      return { success: true };
    }

    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Usuário inválido');
    }

    return this.buildUserContext(user);
  }
}
