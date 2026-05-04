import { Injectable, Logger } from '@nestjs/common';
import { MemisClientService, MemisUserGroup } from './memis-client.service';
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
    const data = (await this.memisClient.postJson(
      '/users',
      user,
    )) as MemisResponse;
    this.logger.log(`Created ${JSON.stringify(user)} ========== in MEMIS`);

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
    username: string, // <- this is the DHIS2 username
    obj: Partial<CreateMemisUserDto>,
  ): Promise<boolean> {
    // 1. Resolve DHIS2 user ID (UID) from username
    const dhisUser = await this.memisClient.findUserByUsername(username);
    if (!dhisUser || !dhisUser[0]) {
      this.logger.warn(
        `updateMemisUser: DHIS user not found for username="${username}"`,
      );
      return false;
    }

    const dhisUserId = dhisUser[0].id; // DHIS2 UID, e.g. "Y9tXvcbAQpF"

    const payload: Record<string, any> = {};

    // username (only if provided)
    if (obj.username !== undefined) payload.username = obj.username;

    // password (only if provided)
    if (obj.password !== undefined) payload.password = obj.password;

    // profile names (only if provided)
    if (obj.profile) {
      if (obj.profile.firstName !== undefined) {
        payload.firstName = obj.profile.firstName;
      }
      if (obj.profile.lastName !== undefined) {
        payload.surname = obj.profile.lastName;
      }
    }

    // roles (only if roleNames provided)
    if (Array.isArray(obj.roleNames)) {
      const userRoles = await this.memisClient.getOrCreateUserRoles(
        obj.roleNames,
      );
      payload.userRoles = userRoles;
    }

    // facilities (only if facilityCodes provided)
    if (Array.isArray(obj.facilityCodes)) {
      const facilityCode = await this.memisClient.getFacilityCode(
        obj.facilityCodes,
      );
      if (!facilityCode) return false; // or skip; your choice
      payload.organisationUnits = facilityCode;
    }

    // If nothing to update, avoid calling MEMIS
    if (Object.keys(payload).length === 0) {
      this.logger.warn(
        `updateMemisUser(${username}) called with empty payload; skipping`,
      );
      return true;
    }

    this.logger.log(
      `Updating MEMIS/DHIS user ${username} (id=${dhisUserId}) with payload: ${JSON.stringify(
        { ...payload, username },
      )}`,
    );

    // Use the DHIS UID in the URL
    const data = (await this.memisClient.putJson(`/users/${dhisUserId}`, {
      ...payload,
      username,
    })) as MemisResponse;

    // adjust expected status if MEMIS returns 200/204/201 for update
    return (
      data?.httpStatusCode === 200 ||
      data?.httpStatusCode === 204 ||
      data?.httpStatusCode === 201
    );
  }

  async getUserGroups(): Promise<MemisUserGroup[]> {
    return this.memisClient.getUserGroups();
  }

  async getUserIdsFromUserGroups(): Promise<string[]> {
    return this.memisClient.getUserIdsFromUserGroups();
  }
}
