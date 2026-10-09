import { DataSourceOptions } from 'typeorm';
import { User } from '../../apps/api/src/app/auth/entities/user.entity';
import { Product } from '../../apps/api/src/app/products/entities/product.entity';
import { Category } from '../../apps/api/src/app/products/entities/category.entity';
import { Order } from '../../apps/api/src/app/orders/entities/order.entity';
import { OrderItem } from '../../apps/api/src/app/orders/entities/order-item.entity';
import { PromoCode } from '../../apps/api/src/app/orders/entities/promo-code.entity';
import { GiftCard } from '../../apps/api/src/app/orders/entities/gift-card.entity';
import { Notification } from '../../apps/api/src/app/notifications/entities/notification.entity';
import { Wishlist } from '../../apps/api/src/app/wishlist/entities/wishlist.entity';

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
