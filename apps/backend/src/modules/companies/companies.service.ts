import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_BRANCH_ID, DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompany() {
    const company = await this.prisma.company.findUnique({
      where: { id: DEFAULT_COMPANY_ID },
      include: {
        branches: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  updateCompany(dto: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id: DEFAULT_COMPANY_ID },
      data: dto,
    });
  }

  findBranches() {
    return this.prisma.branch.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  createBranch(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        name: dto.name,
        code: dto.code,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        city: dto.city,
        state: dto.state,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateBranch(id: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch || branch.companyId !== DEFAULT_COMPANY_ID) {
      throw new NotFoundException('Filial não encontrada');
    }

    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  getDefaultContext() {
    return {
      companyId: DEFAULT_COMPANY_ID,
      branchId: DEFAULT_BRANCH_ID,
    };
  }
}
