import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // makes it globally available
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // so other modules can import it
})
export class PrismaModule {}
