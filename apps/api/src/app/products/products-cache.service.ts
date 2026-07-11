import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsCacheService {
  private readonly TTL = 300;
  private readonly prefix = 'product:';

  constructor(private redisService: RedisService) {}

  async get(id: string): Promise<Product | null> {
    const cached = await this.redisService.get(`${this.prefix}${id}`);
    if (!cached) return null;
    return JSON.parse(cached) as Product;
  }

  async set(product: Product): Promise<void> {
    await this.redisService.set(
      `${this.prefix}${product.id}`,
      JSON.stringify(product),
      this.TTL,
    );
  }

  async invalidate(id: string): Promise<void> {
    await this.redisService.del(`${this.prefix}${id}`);
  }
}
