import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  create(@Body('name') name: string) {
    return this.rolesService.createRole(name);
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  getAll() {
    return this.rolesService.getAllRoles();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  getOne(@Param('id') id: string) {
    return this.rolesService.getRoleById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update role by ID' })
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.rolesService.updateRole(+id, name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete role by ID' })
  delete(@Param('id') id: string) {
    return this.rolesService.deleteRole(+id);
  }
}
