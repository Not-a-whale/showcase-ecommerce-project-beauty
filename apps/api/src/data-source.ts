/**
 * This file is used ONLY by the TypeORM CLI (migration:generate, migration:run, etc.)
 * It is NOT imported by the NestJS app — the app uses data-source.ts in common/.
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432'),
  username: process.env.DB_USERNAME || process.env.DATABASE_USER || 'ecommerce',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'ecommerce_pass',
  database: process.env.DB_NAME || process.env.DATABASE_NAME || 'ecommerce',
  entities: [],  // not needed for raw SQL migrations; avoids ESM .js-extension issues in shared-types
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false, // never true for CLI datasource
  logging: true,
});


