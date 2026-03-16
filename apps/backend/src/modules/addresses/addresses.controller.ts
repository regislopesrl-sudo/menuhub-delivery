import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { AddressesService } from './addresses.service';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Public()
  @Get('zipcode/:cep')
  findByZipcode(@Param('cep') cep: string) {
    return this.addressesService.findByZipcode(cep);
  }

  @Public()
  @Post('reverse-geocode')
  reverseGeocode(@Body() dto: ReverseGeocodeDto) {
    return this.addressesService.reverseGeocode(dto.latitude, dto.longitude);
  }

  @Public()
  @Get('search')
  searchAddress(@Query('q') q: string) {
    return this.addressesService.searchAddress(q);
  }
}
