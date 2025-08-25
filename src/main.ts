import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1️⃣ Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('MAHIS integrated User Management(MIUM) Auth API')
    .setDescription('API documentation for NestJS app with Prisma, JWT, Roles, Programs')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }) // JWT auth
    .build();

  // 2️⃣ Create document
  const document = SwaggerModule.createDocument(app, config);

  // 3️⃣ Setup Swagger UI endpoint
  SwaggerModule.setup('api', app, document);

   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


