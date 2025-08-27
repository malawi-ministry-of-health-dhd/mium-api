import { Injectable } from '@nestjs/common';

import { BaseHttpClientService } from '../services/base-http-client.service';

@Injectable()
export class MemisClientService extends BaseHttpClientService {
  constructor() {
    super('MEMIS'); // uses env vars like MEMIS_BASE_URL
  }

  async postJson(url: string, obj: object): Promise<any> {
    // try {
    const response = await this.axiosInstance.post(url, obj, {
      headers: { 'Content-Type': 'application/json' },
    });
    this.logger.log(`Response from MEMIS: ${JSON.stringify(response.data)}`);
    //   return response.data;
    // } catch (error) {
    //   this.logger.error(
    //     `Failed to create user in MEMIS: ${error} -- ${error.massege}`,
    //   );
    // }
  }
}
