// memis.module.ts
import { Module } from '@nestjs/common';
import { MemisClientService } from './memis-client.service';
import { MemisUserService } from './memis.users.service';

@Module({
  providers: [MemisClientService, MemisUserService],
  exports: [MemisUserService], // export only what you need outside
})
export class MemisModule {}
