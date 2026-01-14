import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('BlihOps Talent & Employer Platform API')
    .setDescription(
      'REST API for the BlihOps Talent & Employer Platform. ' +
      'Provides endpoints for talent management, job management, matching logic, and administrative operations.'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'BearerAuth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-Telegram-Bot-Api-Secret-Token',
        description: 'Secret token for Telegram webhook verification',
      },
      'TelegramWebhookSecret',
    )
    .addServer('https://api.blihops.com/api/v1', 'Production')
    .addServer('https://staging-api.blihops.com/api/v1', 'Staging')
    .addServer('http://localhost:3000/api/v1', 'Local Development')
    .setContact('BlihOps API Support', 'https://blihops.com', 'api-support@blihops.com')
    .setLicense('Proprietary', 'https://blihops.com/license')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'BlihOps API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token after page refresh
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI is available at: http://localhost:${port}/api-docs`);
}

bootstrap();

