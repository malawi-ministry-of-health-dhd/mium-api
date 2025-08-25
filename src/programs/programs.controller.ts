import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProgramsService } from './programs.service';

@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Post()
  async create(@Body('name') name: string) {
    return this.programsService.createProgram(name);
  }

  @Get()
  async findAll() {
    return this.programsService.getAllPrograms();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.programsService.getProgramById(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    return this.programsService.updateProgram(+id, name);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.programsService.deleteProgram(+id);
  }

  @Post('assign/:userId')
  async assignToUser(@Param('userId') userId: string, @Body('programIds') programIds: number[]) {
    return this.programsService.assignProgramsToUser(+userId, programIds);
  }

  @Get('user/:userId')
  async getUserPrograms(@Param('userId') userId: string) {
    return this.programsService.getUserPrograms(+userId);
  }
}
