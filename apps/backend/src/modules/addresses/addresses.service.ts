import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AddressesService {
  private normalizeZipCode(zipCode: string) {
    const digits = zipCode.replace(/\D/g, '');
    if (digits.length !== 8) {
      throw new BadRequestException('CEP inválido');
    }
    return digits;
  }

  async findByZipcode(zipCode: string) {
    const normalized = this.normalizeZipCode(zipCode);

    return {
      cep: normalized,
      street: 'Rua Exemplo',
      district: 'Centro',
      city: 'Peruíbe',
      state: 'SP',
    };
  }
}
