import { DataSourceOptions } from 'typeorm';
import { User } from '../auth/entities/user.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ecommerce',
  entities: [User],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: true,
};
