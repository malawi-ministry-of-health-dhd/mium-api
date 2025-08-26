import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';

@Module({
  providers: [FacilityService],
  controllers: [FacilityController]
})
export class FacilityModule {}
