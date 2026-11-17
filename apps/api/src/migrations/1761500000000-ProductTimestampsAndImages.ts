import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductTimestampsAndImages1761500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt"::timestamptz,
        ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt"::timestamptz,
        ALTER COLUMN "saleStartsAt" TYPE timestamptz USING "saleStartsAt"::timestamptz,
        ALTER COLUMN "saleEndsAt" TYPE timestamptz USING "saleEndsAt"::timestamptz,
        ADD COLUMN "images" text[] NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      UPDATE products SET "images" = ARRAY["imageUrl"] WHERE "imageUrl" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN "images",
        ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt"::timestamp,
        ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt"::timestamp,
        ALTER COLUMN "saleStartsAt" TYPE timestamp USING "saleStartsAt"::timestamp,
        ALTER COLUMN "saleEndsAt" TYPE timestamp USING "saleEndsAt"::timestamp
    `);
  }
}
