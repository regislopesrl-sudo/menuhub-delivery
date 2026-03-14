import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';

@Module({
  controllers: [FinancialController],
  providers: [FinancialService, PrismaService],
  exports: [FinancialService],
})
export class FinancialModule {}
