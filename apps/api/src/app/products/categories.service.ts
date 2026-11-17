import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { RedisService } from '../redis/redis.service';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/category-response.dto';

const CACHE_KEY = 'categories:all';
const CACHE_TTL = 3600;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly redisService: RedisService,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const cached = await this.redisService.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as CategoryResponseDto[];
    }

    const rows = await this.categoryRepo.find({ order: { name: 'ASC' } });
    const dtos = plainToInstance(CategoryResponseDto, rows);
    await this.redisService.set(CACHE_KEY, JSON.stringify(dtos), CACHE_TTL);
    return dtos;
  }
}
