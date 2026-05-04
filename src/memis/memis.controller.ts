import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MemisUserService } from './memis.users.service';

@ApiTags('MEMIS')
@ApiBearerAuth()
@Controller('memis')
export class MemisController {
  constructor(private readonly memisUserService: MemisUserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('user-groups')
  @ApiOperation({ summary: 'Get MEMIS user groups' })
  @ApiResponse({
    status: 200,
    description: 'MEMIS user groups with user IDs',
  })
  async getUserGroups() {
    return this.memisUserService.getUserGroups();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('user-groups/user-ids')
  @ApiOperation({ summary: 'Get MEMIS user IDs from user groups' })
  @ApiResponse({
    status: 200,
    description: 'Unique MEMIS user IDs found in user groups',
  })
  async getUserIdsFromUserGroups() {
    const userIds = await this.memisUserService.getUserIdsFromUserGroups();

    return { userIds };
  }
}
