import { Injectable, Logger } from '@nestjs/common';
import { BaseHttpClientService } from '../services/base-http-client.service';
import axios, { AxiosResponse } from 'axios';

/**
 * Raised when MEMIS/DHIS2 could not be reached at all (DNS, refused connection,
 * timeout). Distinct from a live MEMIS answering with an error, so callers can
 * decide between degrading and refusing the operation outright.
 */
export class MemisUnavailableError extends Error {
  constructor(readonly reason: string) {
    super(`MEMIS is unavailable: ${reason}`);
    this.name = 'MemisUnavailableError';
  }
}

// No HTTP response at all means we never spoke to MEMIS — as opposed to MEMIS
// replying 4xx/5xx, which is a live server rejecting the request.
function connectivityFailure(error: unknown): string | null {
  if (!axios.isAxiosError(error) || error.response) return null;
  return error.code ?? error.message;
}

// --- Interfaces for strong typing ---
export interface MemisResponse {
  httpStatusCode: number;
  [key: string]: unknown;
}

export interface OrganisationUnit {
  id: string;
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
}

export interface MemisUserGroupUser {
  id: string;
  username?: string;
  displayName?: string;
}

export interface MemisUserGroup {
  id: string;
  name?: string;
  displayName?: string;
  users?: MemisUserGroupUser[];
}

interface MemisRole {
  id: string;
  displayName: string;
}
interface MemisUser {
  id: string;
  username: string;
  displayName: string;
}

@Injectable()
export class MemisClientService extends BaseHttpClientService {
  protected readonly logger = new Logger(MemisClientService.name);

  constructor() {
    super('MEMIS'); // uses env vars like MEMIS_BASE_URL
  }

  /**
   * Wraps a MEMIS read so it never surfaces as a bare HTTP 500. Unreachable
   * MEMIS raises MemisUnavailableError; a live MEMIS returning an error falls
   * back to an empty result, matching the postJson/putJson pattern below.
   */
  private async read<T>(
    label: string,
    request: () => Promise<T>,
    fallback: T,
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      const unreachable = connectivityFailure(error);
      if (unreachable) {
        this.logger.error(`MEMIS unreachable during ${label}: ${unreachable}`);
        throw new MemisUnavailableError(unreachable);
      }

      this.logger.error(`Failed to ${label} from MEMIS: ${error}`);
      return fallback;
    }
  }

  // ✅ typed: returns MemisResponse instead of any
  async postJson(url: string, obj: object): Promise<MemisResponse | null> {
    try {
      const response: AxiosResponse<MemisResponse> =
        await this.axiosInstance.post(url, obj, {
          headers: { 'Content-Type': 'application/json' },
        });
      this.logger.log(`Response from MEMIS: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to post to MEMIS: ${error}`);
      return null;
    }
  }
  async putJson(url: string, obj: object): Promise<MemisResponse | null> {
    try {
      const response: AxiosResponse<MemisResponse> =
        await this.axiosInstance.put(url, obj, {
          headers: { 'Content-Type': 'application/json' },
        });
      this.logger.log(`Response from MEMIS: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to post to MEMIS: ${error}`);
      return null;
    }
  }

  // ✅ typed: returns array of OrganisationUnit
  async getFacilityCode(facilityCodes: string[]) {
    return this.read(
      'resolve facility code',
      async () => {
        const res: AxiosResponse<{ organisationUnits: OrganisationUnit[] }> =
          await this.axiosInstance.get(
            `/organisationUnits?filter=code:eq:${facilityCodes[0]}&fields=id`,
          );

        return res.data.organisationUnits ?? [];
      },
      [] as OrganisationUnit[],
    );
  }
  async findUserByUsername(username: string) {
    return this.read(
      'look up user by username',
      async () => {
        const res: AxiosResponse<{ users: MemisUser[] }> =
          await this.axiosInstance.get(
            `/users?filter=username:eq:${username}&fields=id,username,displayName`,
          );

        return res.data.users ?? [];
      },
      [] as MemisUser[],
    );
  }

  // ✅ typed: always returns { id: string }[]
  async getOrCreateUserRoles(roleNames: string[]): Promise<{ id: string }[]> {
    return this.read(
      'resolve user roles',
      () => this.fetchOrCreateUserRoles(roleNames),
      [] as { id: string }[],
    );
  }

  private async fetchOrCreateUserRoles(
    roleNames: string[],
  ): Promise<{ id: string }[]> {
    const roleIds: { id: string }[] = [];

    // 1. Fetch all existing roles once
    const allRolesRes: AxiosResponse<{ userRoles: UserRole[] }> =
      await this.axiosInstance.get(`/userRoles`, {
        params: { fields: 'id,name' },
      });

    const allRoles = allRolesRes.data.userRoles;

    for (const roleName of roleNames) {
      const existingRole = allRoles.find((r) => r.name === roleName);

      if (existingRole) {
        // ✅ Role exists → use id
        roleIds.push({ id: existingRole.id });
      } else {
        // ✅ Create role if not exists
        const createRes: AxiosResponse<any> = await this.axiosInstance.post(
          `/userRoles`,
          {
            name: roleName,
            authorities: ['ALL'], // adjust as needed
          },
        );

        const createdId: string =
          createRes.data?.response?.uid ??
          createRes.data?.response?.importSummaries?.[0]?.reference ??
          '';

        if (!createdId) {
          this.logger.warn(`Failed to create role: ${roleName}`);
          continue;
        }

        roleIds.push({ id: createdId });
      }
    }

    return roleIds;
  }

  async getUserRoles(): Promise<MemisRole[]> {
    return this.read(
      'fetch user roles',
      async () => {
        const allRolesRes: AxiosResponse<{ userRoles: UserRole[] }> =
          await this.axiosInstance.get(`/userRoles`);
        return allRolesRes.data.userRoles ?? [];
      },
      [] as MemisRole[],
    );
  }

  async getUserGroups(): Promise<MemisUserGroup[]> {
    return this.read(
      'fetch user groups',
      async () => {
        const userGroupsRes: AxiosResponse<{ userGroups: MemisUserGroup[] }> =
          await this.axiosInstance.get(`/userGroups`, {
            params: {
              fields: 'id,name,displayName',
            },
          });

        return userGroupsRes.data.userGroups ?? [];
      },
      [] as MemisUserGroup[],
    );
  }

  async getUserIdsFromUserGroups(): Promise<string[]> {
    const userGroups = await this.getUserGroups();
    const userIds = new Set<string>();

    for (const group of userGroups) {
      for (const user of group.users ?? []) {
        if (user.id) {
          userIds.add(user.id);
        }
      }
    }

    return [...userIds];
  }
}
