import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MemisUnavailableError } from './memis-client.service';
import { MemisUserService } from './memis.users.service';

// Flags a degraded response so the client can warn the user without the request
// itself failing — the user management screens stay usable while MEMIS is down.
export const MEMIS_AVAILABLE_HEADER = 'X-Memis-Available';

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
  async getUserGroups(@Res({ passthrough: true }) res: Response) {
    try {
      return await this.memisUserService.getUserGroups();
    } catch (error) {
      if (error instanceof MemisUnavailableError) {
        res.setHeader(MEMIS_AVAILABLE_HEADER, 'false');
        return [];
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('user-groups/user-ids')
  @ApiOperation({ summary: 'Get MEMIS user IDs from user groups' })
  @ApiResponse({
    status: 200,
    description: 'Unique MEMIS user IDs found in user groups',
  })
  async getUserIdsFromUserGroups(@Res({ passthrough: true }) res: Response) {
    try {
      const userIds = await this.memisUserService.getUserIdsFromUserGroups();

      return { userIds };
    } catch (error) {
      if (error instanceof MemisUnavailableError) {
        res.setHeader(MEMIS_AVAILABLE_HEADER, 'false');
        return { userIds: [] };
      }
      throw error;
    }
  }
}
