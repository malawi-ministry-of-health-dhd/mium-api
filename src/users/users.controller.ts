import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // -----------------------------
  // GET ALL USERS (Admin only)
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // -----------------------------
  // GET USER BY ID
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  // -----------------------------
  // ASSIGN ROLES TO USER
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('assign-roles/:userId')
  async assignRoles(
    @Param('userId') userId: string,
    @Body('roles') roles: string[]
  ) {
    return this.usersService.assignRolesToUser(+userId, roles);
  }

  // -----------------------------
  // ASSIGN PROGRAMS TO USER
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('assign-programs/:userId')
  async assignPrograms(
    @Param('userId') userId: string,
    @Body('programs') programs: string[]
  ) {
    return this.usersService.assignProgramsToUser(+userId, programs);
  }

  // -----------------------------
  // DELETE USER
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }

  // -----------------------------
  // UPDATE USER PASSWORD (or other info)
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body('password') password: string
  ) {
    return this.usersService.updateUser(+id, password);
  }
}
