import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../data-source';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { ProcessedEvent } from './entities/processed-event.entity';

@Module({
  imports: [
    PaymentModule,
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      entities: [Payment, ProcessedEvent],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
