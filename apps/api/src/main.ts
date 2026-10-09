import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './app/common/filters/http-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Needed for Stripe webhook signature verification
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: [
      process.env.NEXT_URL || 'http://localhost:3100',
      'http://localhost:4200', // Angular admin
    ],
    credentials: true,
  });

  // Cookies (for refresh token)
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL ||
          'amqp://ecommerce:ecommerce_pass@localhost:5672',
      ],
      queue: 'orders_queue',
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
