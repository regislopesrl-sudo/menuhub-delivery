import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { FinancialService } from './financial.service';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { CreateAccountsReceivableDto } from './dto/create-accounts-receivable.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';

@Controller()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('cash-registers')
  @RequirePermission('financial.view')
  findCashRegisters() {
    return this.financialService.findCashRegisters();
  }

  @Post('cash-registers/open')
  @RequirePermission('financial.cash_open')
  openCashRegister(@Body() dto: OpenCashRegisterDto) {
    return this.financialService.openCashRegister(dto);
  }

  @Post('cash-registers/:id/close')
  @RequirePermission('financial.cash_close')
  closeCashRegister(@Param('id') id: string, @Body() dto: CloseCashRegisterDto) {
    return this.financialService.closeCashRegister(id, dto);
  }

  @Post('cash-movements')
  @RequirePermission('financial.cash_movement')
  createCashMovement(@Body() dto: CreateCashMovementDto) {
    return this.financialService.createCashMovement(dto);
  }

  @Get('accounts-payable')
  @RequirePermission('financial.accounts_payable')
  findAccountsPayable() {
    return this.financialService.findAccountsPayable();
  }

  @Post('accounts-payable')
  @RequirePermission('financial.accounts_payable')
  createAccountsPayable(@Body() dto: CreateAccountsPayableDto) {
    return this.financialService.createAccountsPayable(dto);
  }

  @Get('accounts-receivable')
  @RequirePermission('financial.accounts_receivable')
  findAccountsReceivable() {
    return this.financialService.findAccountsReceivable();
  }

  @Post('accounts-receivable')
  @RequirePermission('financial.accounts_receivable')
  createAccountsReceivable(@Body() dto: CreateAccountsReceivableDto) {
    return this.financialService.createAccountsReceivable(dto);
  }

  @Get('financial/dashboard')
  @RequirePermission('financial.view')
  getDashboard() {
    return this.financialService.getDashboard();
  }
}

