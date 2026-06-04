import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

function maskAuth(header: string | undefined): string {
  if (!header) return '-';
  if (header.toLowerCase().startsWith('bearer ')) return 'Bearer ***';
  if (header.toLowerCase().startsWith('basic '))  return 'Basic ***';
  return '***';
}

// Prefer proxy-forwarded IP over socket IP
function resolveIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }
  return req.headers['x-real-ip'] as string ?? req.ip ?? '-';
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const userId = (req as any).user?.id ?? (req as any).user?.sub ?? '-';
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';

      this.logger.log(level, 'HTTP', {
        context: 'HTTP',
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        userId,
        // Network
        ip:             resolveIp(req),
        forwardedFor:   headers['x-forwarded-for'] ?? '-',
        // Client
        userAgent:      headers['user-agent'] ?? '-',
        origin:         headers['origin'] ?? headers['referer'] ?? '-',
        // Request details
        contentType:    headers['content-type'] ?? '-',
        accept:         headers['accept'] ?? '-',
        // Auth — token value is never logged
        authorization:  maskAuth(headers['authorization']),
        // Response
        contentLength:  res.get('content-length') ?? '-',
      });
    });

    next();
  }
}
