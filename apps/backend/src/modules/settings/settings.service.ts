import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DEFAULT_BRANCH_ID, DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.companySetting.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      orderBy: [{ branchId: 'asc' }, { key: 'asc' }],
    });
  }

  async update(dto: UpdateSettingsDto) {
    for (const item of dto.items) {
      await this.prisma.companySetting.upsert({
        where: {
          companyId_branchId_key: {
            companyId: DEFAULT_COMPANY_ID,
            branchId: item.branchId ?? DEFAULT_BRANCH_ID,
            key: item.key,
          },
        },
        update: {
          value: item.value as Prisma.InputJsonValue,
        },
        create: {
          companyId: DEFAULT_COMPANY_ID,
          branchId: item.branchId ?? DEFAULT_BRANCH_ID,
          key: item.key,
          value: item.value as Prisma.InputJsonValue,
        },
      });
    }

    return this.findAll();
  }
}
