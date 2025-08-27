import { Injectable, Logger } from '@nestjs/common';
import { MemisClientService } from './memis-client.service';

@Injectable()
export class MemisUserService {
  protected readonly logger = new Logger(MemisUserService.name);

  constructor(private readonly memisClient: MemisClientService) {}

  async createMemisUser(user: object): Promise<any> {
    this.logger.log(`Creating ${JSON.stringify(user)} in MEMIS`);

    const data = await this.memisClient.postJson('/users', user);
    this.logger.log(`Created ${JSON.stringify(data)} in MEMIS`);
    return data;
  }
}
