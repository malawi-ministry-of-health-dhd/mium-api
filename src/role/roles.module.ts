import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MemisClientService } from 'src/memis/memis-client.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService, MemisClientService],
  exports: [RolesService],
})
export class RolesModule {}
