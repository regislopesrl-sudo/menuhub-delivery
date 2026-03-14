import { Module } from '@nestjs/common';
import { DeliveryFeesService } from './delivery-fees.service';

@Module({
  providers: [DeliveryFeesService],
  exports: [DeliveryFeesService],
})
export class DeliveryFeesModule {}
