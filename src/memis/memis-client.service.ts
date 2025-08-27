import { Injectable, Logger } from '@nestjs/common';
import { BaseHttpClientService } from '../services/base-http-client.service';
import { AxiosResponse } from 'axios';

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
}

@Injectable()
export class MemisClientService extends BaseHttpClientService {
  protected readonly logger = new Logger(MemisClientService.name);

  constructor() {
    super('MEMIS'); // uses env vars like MEMIS_BASE_URL
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

  // ✅ typed: returns array of OrganisationUnit
  async getFacilityCode(facilityCodes: string[]) {
    const res: AxiosResponse<{ organisationUnits: OrganisationUnit[] }> =
      await this.axiosInstance.get(
        `/organisationUnits?filter=code:eq:${facilityCodes[0]}&fields=id`,
      );

    return res.data.organisationUnits;
  }

  // ✅ typed: always returns { id: string }[]
  async getOrCreateUserRoles(roleNames: string[]): Promise<{ id: string }[]> {
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
}
