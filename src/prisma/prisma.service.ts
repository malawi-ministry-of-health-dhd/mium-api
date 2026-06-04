import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Returns e.g. "SELECT User", "INSERT UserRole", "UPDATE User", "DELETE Session"
// Params are intentionally never logged.
function summarizeSql(raw: string): string {
  const q = raw.trim();

  let m: RegExpMatchArray | null;

  m = q.match(/^SELECT\b.+?\bFROM\b\s+(?:"[^"]+"\."([^"]+)"|`([^`]+)`|(\w+))/i);
  if (m) return `SELECT ${m[1] ?? m[2] ?? m[3]}`;

  m = q.match(/^INSERT\s+INTO\s+(?:"[^"]+"\."([^"]+)"|`([^`]+)`|(\w+))/i);
  if (m) return `INSERT ${m[1] ?? m[2] ?? m[3]}`;

  m = q.match(/^UPDATE\s+(?:"[^"]+"\."([^"]+)"|`([^`]+)`|(\w+))/i);
  if (m) return `UPDATE ${m[1] ?? m[2] ?? m[3]}`;

  m = q.match(/^DELETE\s+FROM\s+(?:"[^"]+"\."([^"]+)"|`([^`]+)`|(\w+))/i);
  if (m) return `DELETE ${m[1] ?? m[2] ?? m[3]}`;

  // Fallback: first keyword only
  return q.split(/\s+/).slice(0, 2).join(' ');
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    (this as any).$on('query', (e: any) => {
      this.logger.verbose(summarizeSql(e.query), {
        context: 'SQL',
        duration: `${e.duration}ms`,
      });
    });

    (this as any).$on('info', (e: any) => {
      this.logger.info(e.message, { context: 'Prisma' });
    });

    (this as any).$on('warn', (e: any) => {
      this.logger.warn(e.message, { context: 'Prisma' });
    });

    (this as any).$on('error', (e: any) => {
      this.logger.error(e.message, { context: 'Prisma' });
    });

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
