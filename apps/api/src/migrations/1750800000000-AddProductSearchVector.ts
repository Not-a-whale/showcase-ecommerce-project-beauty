import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductSearchVector1750800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add a generated tsvector column that automatically combines name + description
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN search_vector tsvector
          GENERATED ALWAYS AS (
            to_tsvector('english', name || ' ' || coalesce(description, ''))
          ) STORED
    `);

    // GIN index makes full-text search fast (@@, to_tsquery, plainto_tsquery, etc.)
    await queryRunner.query(`
      CREATE INDEX idx_products_search ON products USING GIN (search_vector)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_search`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS search_vector`);
  }
}

