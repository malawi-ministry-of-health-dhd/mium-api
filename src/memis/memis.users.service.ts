import { Injectable, Logger } from '@nestjs/common';
import { MemisClientService } from './memis-client.service';
import { PrismaService } from '../prisma/prisma.service'; // adjust path

interface UserProfile {
  firstName?: string;
  lastName?: string;
}

interface CreateMemisUserDto {
  username: string;
  password: string;
  roleNames: string[];
  profile?: UserProfile;
  facilityCodes?: string[];
}

interface MemisResponse {
  httpStatusCode: number;
  [key: string]: any;
}

@Injectable()
export class MemisUserService {
  protected readonly logger = new Logger(MemisUserService.name);

  constructor(
    private readonly memisClient: MemisClientService,
    private readonly prisma: PrismaService,
  ) {}

  async createMemisUser(obj: CreateMemisUserDto): Promise<boolean> {
    const { password, username, roleNames, profile, facilityCodes } = obj;
    if (!facilityCodes) return false;
    const facilityCode = await this.memisClient.getFacilityCode(facilityCodes);

    if (!facilityCode) return false;

    const userRoles: { id: string }[] =
      await this.memisClient.getOrCreateUserRoles(roleNames);

    const user = {
      username,
      password,
      firstName: profile?.firstName ?? '',
      surname: profile?.lastName ?? '',
      userRoles,
      organisationUnits: facilityCode,
    };
    this.logger.log(`Created ${JSON.stringify(user)} ========== in MEMIS`);
    const data = (await this.memisClient.postJson(
      '/users',
      user,
    )) as MemisResponse;

    if (data?.httpStatusCode === 201) {
      this.logger.log(`Created ${JSON.stringify(user)} in MEMIS`);
      return true;
    }

    return false;
  }
}
