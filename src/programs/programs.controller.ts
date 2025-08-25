import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramDto, CreateProgramDto, AssignProgramsDto } from './dto/program.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new program' })
  @ApiBody({ type: CreateProgramDto })
  @ApiResponse({ status: 201, description: 'Program created successfully', type: ProgramDto })
  async create(@Body() dto: CreateProgramDto) {
    return this.programsService.createProgram(dto.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all programs' })
  @ApiResponse({ status: 200, description: 'List of programs', type: [ProgramDto] })
  async findAll() {
    return this.programsService.getAllPrograms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get program by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Program details', type: ProgramDto })
  async findOne(@Param('id') id: string) {
    return this.programsService.getProgramById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update a program' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateProgramDto })
  @ApiResponse({ status: 200, description: 'Program updated successfully', type: ProgramDto })
  async update(@Param('id') id: string, @Body() dto: CreateProgramDto) {
    return this.programsService.updateProgram(+id, dto.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a program' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Program deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.programsService.deleteProgram(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('assign/:userId')
  @ApiOperation({ summary: 'Assign programs to a user' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiBody({ type: AssignProgramsDto })
  @ApiResponse({ status: 200, description: 'Programs assigned successfully' })
  async assignToUser(@Param('userId') userId: string, @Body() dto: AssignProgramsDto) {
    return this.programsService.assignProgramsToUser(+userId, dto.programIds);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get programs assigned to a user' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'List of programs', type: [ProgramDto] })
  async getUserPrograms(@Param('userId') userId: string) {
    return this.programsService.getUserPrograms(+userId);
  }
}
