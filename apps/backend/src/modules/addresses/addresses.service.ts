import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AddressesService {
  async findByZipcode(cep: string) {
    const normalizedCep = cep.replace(/\D/g, '');

    if (normalizedCep.length !== 8) {
      throw new BadRequestException('CEP inválido');
    }

    const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
    const data = await response.json();

    if (!response.ok || data?.erro) {
      throw new NotFoundException('CEP não encontrado');
    }

    return this.mapViaCepResponse(data, normalizedCep);
  }

  async reverseGeocode(latitude: number, longitude: number) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new BadRequestException('Latitude ou longitude inválidas');
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new BadRequestException('Coordenadas fora do intervalo');
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    );
    const data = await response.json();

    if (!response.ok || !data?.address) {
      throw new NotFoundException('Endereço não encontrado para as coordenadas informadas');
    }

    return this.mapNominatimResponse(data.address, lat, lng);
  }

  async searchAddress(query: string) {
    const term = (query ?? '').trim();
    if (!term) {
      return [];
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        term,
      )}&addressdetails=1&limit=6`,
      {
        headers: {
          'User-Agent': 'delivery-system/1.0',
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Falha ao buscar endereços');
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => this.mapSearchResult(item));
  }

  private mapViaCepResponse(data: any, normalizedCep: string) {
    return {
      cep: data.cep?.replace(/\D/g, '') ?? normalizedCep,
      street: data.logradouro ?? '',
      complement: data.complemento ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
      ibgeCode: data.ibge ?? '',
    };
  }

  private mapNominatimResponse(address: any, lat: number, lng: number) {
    return {
      cep: address.postcode ?? '',
      street:
        address.road ?? address.pedestrian ?? address.residential ?? address.neighbourhood ?? '',
      complement: '',
      district: address.suburb ?? address.neighbourhood ?? '',
      city: address.city ?? address.town ?? address.village ?? address.county ?? '',
      state: address.state ?? '',
      ibgeCode: '',
      latitude: lat,
      longitude: lng,
    };
  }

  private mapSearchResult(data: any) {
    return {
      placeId: data.place_id,
      label: data.display_name,
      latitude: Number(data.lat),
      longitude: Number(data.lon),
      street:
        data.address?.road ||
        data.address?.pedestrian ||
        data.address?.residential ||
        data.address?.neighbourhood ||
        '',
      district:
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.city_district ||
        '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state ?? '',
      zipCode: data.address?.postcode?.replace(/\D/g, '') ?? '',
    };
  }
}
