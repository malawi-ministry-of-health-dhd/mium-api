import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './role/roles.module';
import { FacilityModule } from './facility/facility.module';

@Module({
  imports: [AuthModule, UsersModule, ProgramsModule, PrismaModule, RolesModule, FacilityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
