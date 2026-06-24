import { DataSourceOptions } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { PromoCode } from '../orders/entities/promo-code.entity';
import { GiftCard } from '../orders/entities/gift-card.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';

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
  synchronize: false, // schema is managed exclusively via migrations — run: npm run migration:run
  logging: true,
};
