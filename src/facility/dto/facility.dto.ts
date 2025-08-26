import { ApiProperty } from '@nestjs/swagger';

export class CreateFacilityDto {
  @ApiProperty({ example: 'AB Medical Clinic' })
  facility_name: string;

  @ApiProperty({ example: 'LL040007' })
  facility_code: string;

  @ApiProperty({
    example: [
      { url: 'https://dhis2.health.gov.mw/api/organisationUnits/zYfP0gkHRJH.json', code: 'zYfP0gkHRJH', system: 'DHIS2' },
      { url: 'https://lmis.health.gov.mw', code: 'LL4040', system: 'OpenLMIS' },
    ],
  })
  facility_code_mapping: any[];
}

export class UpdateFacilityDto {
  @ApiProperty({ example: 'New Clinic Name', required: false })
  facility_name?: string;

  @ApiProperty({ example: 'LL040008', required: false })
  facility_code?: string;

  @ApiProperty({ example: [], required: false })
  facility_code_mapping?: any[];
}

export class FacilityDto {
  facility_name: string;
  facility_code: string;
  facility_code_mapping: any[];
}
