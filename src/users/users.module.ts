import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MemisModule } from '../memis/memis.module';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesService } from '../role/roles.service';
import { ProgramsService } from '../programs/programs.service';

@Module({
  imports: [PrismaModule, MemisModule],
  providers: [UsersService, RolesService, ProgramsService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
