import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MEMIS_AVAILABLE_HEADER } from './memis/memis.controller';
import * as os from 'os';

function getLocalIp(): string {
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    // Without this the browser hides the header from JS on cross-origin reads,
    // so the client could not tell a degraded response from a genuinely empty one.
    exposedHeaders: [MEMIS_AVAILABLE_HEADER],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('MAHIS integrated User Management(MIUM) Auth API')
    .setDescription('API documentation for NestJS app with Prisma, JWT, Roles, Programs')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  const localIp = getLocalIp();
  const logger  = app.get(WINSTON_MODULE_NEST_PROVIDER);

  logger.log(`Local:   http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`Network: http://${localIp}:${port}/api`, 'Bootstrap');
  logger.log(`Docs:    http://${localIp}:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
