import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUserDto, UserDto, AssignRolesDto, AssignProgramsDto, UpdateUserDto, AssignFacilitiesDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // -----------------------------
  // GET ALL USERS (Admin only)
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserDto] })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // -----------------------------
  // GET USER BY ID
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details', type: UserDto })
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  // -----------------------------
  // ASSIGN ROLES TO USER
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('assign-roles/:userId')
  @ApiOperation({ summary: 'Assign roles to a user' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiBody({ type: AssignRolesDto })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully' })
  async assignRoles(
    @Param('userId') userId: string,
    @Body('roles') roles: string[],
  ) {
    return this.usersService.assignRolesToUser(+userId, roles);
  }

  // -----------------------------
  // ASSIGN PROGRAMS TO USER
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('assign-programs/:userId')
  @ApiOperation({ summary: 'Assign programs to a user' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiBody({ type: AssignProgramsDto })
  @ApiResponse({ status: 200, description: 'Programs assigned successfully' })
  async assignPrograms(
    @Param('userId') userId: string,
    @Body('programs') programs: string[],
  ) {
    return this.usersService.assignProgramsToUser(+userId, programs);
  }

  // -----------------------------
  // DELETE USER
  // -----------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }

  // -----------------------------
  // UPDATE USER PASSWORD (or other info)
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.usersService.updateUser(+id, password);
  }

  // -----------------------------
  // REGISTER NEW USER
  // -----------------------------
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserDto })
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(
      dto.username,
      dto.password,
      dto.roles,
      dto.programs,
    );
  }

  // -----------------------------
// ASSIGN FACILITIES TO USER
// -----------------------------
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Post('assign-facilities/:userId')
@ApiOperation({ summary: 'Assign facilities to a user' })
@ApiParam({ name: 'userId', type: Number, description: 'User ID' })
@ApiBody({ type: AssignFacilitiesDto })
@ApiResponse({ status: 200, description: 'Facilities assigned successfully' })
async assignFacilities(
  @Param('userId') userId: string,
  @Body('facilities') facilities: number[],
) {
  return this.usersService.assignFacilitiesToUser(+userId, facilities);
}

}
