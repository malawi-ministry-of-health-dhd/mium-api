import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, errors } = winston.format;

// ANSI color helpers
const c = {
  reset:   '\x1b[0m',
  dim:     '\x1b[2m',
  bold:    '\x1b[1m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  green:   '\x1b[32m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  gray:    '\x1b[90m',
  white:   '\x1b[37m',
  bRed:    '\x1b[91m',
  bGreen:  '\x1b[92m',
  bYellow: '\x1b[93m',
  bCyan:   '\x1b[96m',
  bMagenta:'\x1b[95m',
};

const LEVEL_COLOR: Record<string, string> = {
  error:   c.bRed + c.bold,
  warn:    c.bYellow + c.bold,
  info:    c.bGreen,
  http:    c.cyan,
  verbose: c.magenta,
  debug:   c.blue,
};

const LEVEL_LABEL: Record<string, string> = {
  error:   'ERR',
  warn:    'WRN',
  info:    'INF',
  http:    'HTT',
  verbose: 'SQL',
  debug:   'DBG',
};

const consoleFormat = winston.format.printf((info) => {
  const ts   = `${c.dim}${info.timestamp}${c.reset}`;
  const lvl  = info.level as string;
  const col  = LEVEL_COLOR[lvl] ?? c.white;
  const tag  = `${col}[${LEVEL_LABEL[lvl] ?? lvl.toUpperCase().slice(0, 3)}]${c.reset}`;
  const ctx  = info['context'] ? `${c.bCyan}[${info['context']}]${c.reset} ` : '';

  // HTTP access line
  if (info['context'] === 'HTTP') {
    const sc    = info['statusCode'] as number;
    const scCol = sc >= 500 ? c.bRed : sc >= 400 ? c.bYellow : c.bGreen;
    const pad   = ' '.repeat(ts.replace(/\x1b\[[0-9;]*m/g, '').length + 7); // align second line

    const line1 = `${ts} ${tag} ${ctx}${scCol}${sc}${c.reset} ${c.bold}${info['method']}${c.reset} ${c.white}${info['url']}${c.reset} ${c.gray}${info['duration']}${c.reset}`;

    const line2 = `${pad}${c.gray}` +
      `ip:${info['ip']}` +
      (info['forwardedFor'] !== '-' ? ` fwd:${info['forwardedFor']}` : '') +
      ` auth:${info['authorization']}` +
      ` origin:${info['origin']}` +
      ` ct:${info['contentType']}` +
      ` ua:${String(info['userAgent']).slice(0, 60)}` +
      (info['userId'] !== '-' ? ` user:${info['userId']}` : '') +
      `${c.reset}`;

    return `${line1}\n${line2}`;
  }

  // SQL summary line
  if (info['context'] === 'SQL') {
    return `${ts} ${tag} ${ctx}${c.bMagenta}${info.message}${c.reset} ${c.gray}${info['duration']}${c.reset}`;
  }

  const msg  = `${col}${info.message}${c.reset}`;
  const stack = info['stack'] ? `\n${c.gray}${info['stack']}${c.reset}` : '';
  return `${ts} ${tag} ${ctx}${msg}${stack}`;
});

const fileRotateOptions = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
};

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'verbose',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        errors({ stack: true }),
        timestamp({ format: 'HH:mm:ss.SSS' }),
        consoleFormat,
      ),
    }),

    // All logs (JSON)
    new winston.transports.DailyRotateFile({
      ...fileRotateOptions,
      filename: 'logs/app-%DATE%.log',
      level: 'verbose',
    }),

    // Errors only
    new winston.transports.DailyRotateFile({
      ...fileRotateOptions,
      filename: 'logs/error-%DATE%.log',
      level: 'error',
    }),

    // SQL only (context='SQL', no params — set by PrismaService)
    new winston.transports.DailyRotateFile({
      ...fileRotateOptions,
      filename: 'logs/sql-%DATE%.log',
      level: 'verbose',
      format: combine(
        winston.format((info) => (info['context'] === 'SQL' ? info : false))(),
        winston.format.json(),
      ),
    }),
  ],
};
