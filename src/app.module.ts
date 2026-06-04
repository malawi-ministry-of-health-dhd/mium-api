import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MemisModule } from './memis/memis.module';
import { ProgramsModule } from './programs/programs.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './role/roles.module';
import { FacilityModule } from './facility/facility.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { winstonConfig } from './logger/winston.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UsersModule,
    ProgramsModule,
    PrismaModule,
    RolesModule,
    FacilityModule,
    MemisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
