import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTypeormMetadata1750800000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // TypeORM needs this table to track generated/view columns when synchronize:true is used.
    // Without it, TypeORM crashes on startup when it finds a generated column (search_vector)
    // that isn't declared in an entity.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS typeorm_metadata (
        type    varchar NOT NULL,
        database varchar,
        schema  varchar,
        name    varchar,
        "table" varchar,
        value   text
      )
    `);

    // Register search_vector so TypeORM treats it as a known generated column and won't drop it.
    await queryRunner.query(`
      INSERT INTO typeorm_metadata (type, database, schema, name, "table", value)
      VALUES (
        'GENERATED_COLUMN',
        'ecommerce',
        'public',
        'search_vector',
        'products',
        'to_tsvector(''english''::regconfig, (name::text || '' ''::text) || COALESCE(description, ''''::text))'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM typeorm_metadata WHERE name = 'search_vector' AND "table" = 'products'
    `);
  }
}

