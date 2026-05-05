// memis.module.ts
import { Module } from '@nestjs/common';
import { MemisController } from './memis.controller';
import { MemisClientService } from './memis-client.service';
import { MemisUserService } from './memis.users.service';

@Module({
  controllers: [MemisController],
  providers: [MemisClientService, MemisUserService],
  exports: [MemisUserService], // export only what you need outside
})
export class MemisModule {}
