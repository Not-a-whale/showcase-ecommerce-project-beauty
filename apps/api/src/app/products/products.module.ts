import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsCacheService } from './products-cache.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsCacheService],
})
export class ProductsModule {}
