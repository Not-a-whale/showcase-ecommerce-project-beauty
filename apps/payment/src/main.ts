/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL ||
          'amqp://ecommerce:ecommerce_pass@localhost:5672',
      ],
      queue: 'payment_queue',
      queueOptions: { durable: true },
      persistent: true,
    },
  });
  await app.startAllMicroservices();
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
