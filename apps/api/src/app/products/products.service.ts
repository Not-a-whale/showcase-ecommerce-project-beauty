import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SortType } from '@ecommerce/shared-types';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';

interface SortMeta {
  column: string;
  op: string;
  idOp: string;
  field: keyof Product;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = this.productRepo.create(dto);
    try {
      const saved = await this.productRepo.save(product);
      return plainToInstance(ProductResponseDto, saved);
    } catch (err: any) {
      if (err?.code === '23503') {
        throw new BadRequestException('Category not found');
      }
      throw err;
    }
  }

  async findAll(query: ProductQueryDto): Promise<{
    items: ProductResponseDto[];
    nextCursor: string | null;
  }> {
    const limit = query.limit ?? 20;
    const sort = query.sort ?? 'newest';

    const qb = this.productRepo
      .createQueryBuilder('product')
      .where('product.isDeleted = :isDeleted', { isDeleted: false });

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.search) {
      qb.andWhere(
        `product.search_vector @@ plainto_tsquery('english', :search)`,
        { search: query.search },
      );
    }

    if (query.cursor) {
      this.applyCursor(qb, sort, query.cursor);
    }

    this.applySort(qb, sort);
    qb.take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];

    const nextCursor =
      hasMore && last
        ? this.encodeCursor({
            value: this.getCursorValue(last, sort),
            id: last.id,
          })
        : null;

    return {
      items: plainToInstance(ProductResponseDto, items),
      nextCursor,
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.findEntity(id);
    return plainToInstance(ProductResponseDto, product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.findEntity(id);
    this.productRepo.merge(product, dto);
    const saved = await this.productRepo.save(product);
    return plainToInstance(ProductResponseDto, saved);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findEntity(id);
    product.isDeleted = true;
    await this.productRepo.save(product);
  }

  private async findEntity(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private getSortMeta(sort?: SortType): SortMeta {
    switch (sort) {
      case 'price_asc':
        return { column: 'product.price', op: '>', idOp: '>', field: 'price' };
      case 'price_desc':
        return { column: 'product.price', op: '<', idOp: '>', field: 'price' };
      case 'oldest':
        return {
          column: 'product.createdAt',
          op: '>',
          idOp: '>',
          field: 'createdAt',
        };
      case 'popular':
        return {
          column: 'product.purchaseCount',
          op: '<',
          idOp: '>',
          field: 'purchaseCount',
        };
      case 'newest':
      default:
        return {
          column: 'product.createdAt',
          op: '<',
          idOp: '>',
          field: 'createdAt',
        };
    }
  }

  private applySort(qb: SelectQueryBuilder<Product>, sort?: SortType): void {
    const { column, op } = this.getSortMeta(sort);
    const direction = op === '>' ? 'ASC' : 'DESC';
    qb.orderBy(column, direction).addOrderBy('product.id', 'ASC');
  }

  private applyCursor(
    qb: SelectQueryBuilder<Product>,
    sort: SortType,
    cursor: string,
  ): void {
    const decoded = this.decodeCursor(cursor);
    const { column, op, idOp } = this.getSortMeta(sort);

    qb.andWhere(
      `(${column} ${op} :value OR (${column} = :value AND product.id ${idOp} :id))`,
      { value: decoded.value, id: decoded.id },
    );
  }

  private getCursorValue(product: Product, sort?: SortType): any {
    const { field } = this.getSortMeta(sort);
    return product[field];
  }

  private encodeCursor(payload: Record<string, any>): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private decodeCursor(cursor: string): Record<string, any> {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      throw new BadRequestException('Invalid cursor');
    }
  }
}
