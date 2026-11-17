import { join } from 'path';
import { Order } from './app/orders/entities/order.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './app/auth/entities/user.entity';
import { Product } from './app/products/entities/product.entity';
import { Category } from './app/products/entities/category.entity';
import { OrderItem } from './app/orders/entities/order-item.entity';
import { PromoCode } from './app/orders/entities/promo-code.entity';
import { GiftCard } from './app/orders/entities/gift-card.entity';
import { Notification } from './app/notifications/entities/notification.entity';
import { Wishlist } from './app/wishlist/entities/wishlist.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'ecommerce',
  password: process.env.DB_PASSWORD || 'ecommerce_pass',
  database: process.env.DB_NAME || 'ecommerce',
  entities: [
    User,
    Product,
    Category,
    Order,
    OrderItem,
    PromoCode,
    GiftCard,
    Notification,
    Wishlist,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false, // schema is managed exclusively via migrations — run: npm run migration:run
  logging: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
