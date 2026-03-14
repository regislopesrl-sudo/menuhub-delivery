import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryFeesService {
  private readonly fees: Record<string, number> = {
    centro: 6,
    'jardim brasil': 8,
    litoral: 10,
  };

  getFee(neighborhood?: string): number {
    if (!neighborhood) return 0;
    const key = neighborhood.trim().toLowerCase();
    return this.fees[key] ?? 12;
  }
}
