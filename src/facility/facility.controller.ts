import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { CreateFacilityDto, UpdateFacilityDto, FacilityDto } from './dto/facility.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Facilities')
@ApiBearerAuth()
@Controller('facilities')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new facility' })
  @ApiBody({ type: CreateFacilityDto })
  @ApiResponse({ status: 201, description: 'Facility created successfully', type: FacilityDto })
  create(@Body() body: CreateFacilityDto) {
    return this.facilityService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all facilities' })
  @ApiResponse({ status: 200, description: 'List of facilities', type: [FacilityDto] })
  findAll() {
    return this.facilityService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a facility by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Facility details', type: FacilityDto })
  findOne(@Param('id') id: string) {
    return this.facilityService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update a facility' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateFacilityDto })
  @ApiResponse({ status: 200, description: 'Facility updated successfully', type: FacilityDto })
  update(@Param('id') id: string, @Body() body: UpdateFacilityDto) {
    return this.facilityService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a facility' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Facility deleted successfully', type: FacilityDto })
  remove(@Param('id') id: string) {
    return this.facilityService.remove(+id);
  }
}
