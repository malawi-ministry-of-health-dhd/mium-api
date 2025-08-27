import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MemisModule } from '../memis/memis.module';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, MemisModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
