import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, PrismaService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
