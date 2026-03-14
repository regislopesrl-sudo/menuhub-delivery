import { Body, Controller, Get, Patch, Post, Param } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CompaniesService } from './companies.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('companies/me')
  @RequirePermission('companies.view')
  getCompany() {
    return this.companiesService.getCompany();
  }

  @Patch('companies/me')
  @RequirePermission('companies.update')
  updateCompany(@Body() dto: UpdateCompanyDto) {
    return this.companiesService.updateCompany(dto);
  }

  @Get('branches')
  @RequirePermission('branches.view')
  findBranches() {
    return this.companiesService.findBranches();
  }

  @Post('branches')
  @RequirePermission('branches.create')
  createBranch(@Body() dto: CreateBranchDto) {
    return this.companiesService.createBranch(dto);
  }

  @Patch('branches/:id')
  @RequirePermission('branches.update')
  updateBranch(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.companiesService.updateBranch(id, dto);
  }
}
