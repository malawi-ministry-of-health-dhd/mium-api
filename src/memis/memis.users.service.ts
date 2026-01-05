import { Injectable, Logger } from '@nestjs/common';
import { MemisClientService } from './memis-client.service';
import { PrismaService } from '../prisma/prisma.service';

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
    const data = (await this.memisClient.postJson('/users', user)) as MemisResponse;

    return data?.httpStatusCode === 201;
  }

  /**
   * Update MEMIS user:
   * - Only include fields that are provided.
   * - Only compute organisationUnits if facilityCodes is provided.
   * - Only compute userRoles if roleNames is provided.
   * - Only set firstName/surname if profile is provided and fields exist.
   */
  async updateMemisUser(
    id: string,
    obj: Partial<CreateMemisUserDto>,
  ): Promise<boolean> {
    const payload: Record<string, any> = {};

    // username (only if provided)
    if (obj.username !== undefined) payload.username = obj.username;

    // password (only if provided)
    if (obj.password !== undefined) payload.password = obj.password;

    // profile names (only if provided)
    if (obj.profile) {
      if (obj.profile.firstName !== undefined) payload.firstName = obj.profile.firstName;
      if (obj.profile.lastName !== undefined) payload.surname = obj.profile.lastName;
    }

    // roles (only if roleNames provided)
    if (Array.isArray(obj.roleNames)) {
      const userRoles = await this.memisClient.getOrCreateUserRoles(obj.roleNames);
      payload.userRoles = userRoles;
    }

    // facilities (only if facilityCodes provided)
    if (Array.isArray(obj.facilityCodes)) {
      const facilityCode = await this.memisClient.getFacilityCode(obj.facilityCodes);
      if (!facilityCode) return false; // you can choose to skip instead, but this is safer
      payload.organisationUnits = facilityCode;
    }

    // If nothing to update, avoid calling MEMIS
    if (Object.keys(payload).length === 0) {
      this.logger.warn(`updateMemisUser(${id}) called with empty payload; skipping`);
      return true;
    }

    this.logger.log(`Updating MEMIS user ${id} with payload: ${JSON.stringify(payload)}`);

    // If MEMIS expects PUT/PATCH, use the correct method in your client.
    // Keeping postJson since that's what you used, but update endpoint might be PUT.
    const data = (await this.memisClient.postJson(`/users/${id}`, payload)) as MemisResponse;

    // adjust expected status if MEMIS returns 200/204 for update
    return data?.httpStatusCode === 200 || data?.httpStatusCode === 204 || data?.httpStatusCode === 201;
  }
}
