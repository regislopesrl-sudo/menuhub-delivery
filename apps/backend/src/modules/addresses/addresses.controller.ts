import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { AddressesService } from './addresses.service';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Public()
  @Get('zipcode/:cep')
  findByZipcode(@Param('cep') cep: string) {
    return this.addressesService.findByZipcode(cep);
  }
}
