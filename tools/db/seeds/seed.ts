import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Run: npx ts-node tools/db/seeds/seed.ts
 *
 * Make sure postgres is running (docker-compose up -d postgres)
 */

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'ecommerce',
  password: process.env.DATABASE_PASSWORD || 'ecommerce_pass',
  database: process.env.DATABASE_NAME || 'ecommerce',
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('Connected to database');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // --- Categories ---
    const categories = [
      { name: 'T-Shirts', slug: 'tshirts' },
      { name: 'Dresses', slug: 'dresses' },
      { name: 'Shoes', slug: 'shoes' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Outerwear', slug: 'outerwear' },
    ];

    const insertedCategories = [];
    for (const cat of categories) {
      const result = await queryRunner.query(
        `INSERT INTO categories (id, name, slug)
         VALUES (gen_random_uuid(), $1, $2)
         ON CONFLICT (slug) DO UPDATE SET name = $1
         RETURNING id, slug`,
        [cat.name, cat.slug],
      );
      insertedCategories.push(result[0]);
    }
    console.log(`Seeded ${insertedCategories.length} categories`);

    // --- Products ---
    const getCategoryId = (slug: string) =>
      insertedCategories.find((c) => c.slug === slug)?.id;

    const products = [
      // T-Shirts
      { name: 'Classic White Tee', description: 'Essential cotton crew neck', price: 29.99, stock: 100, categorySlug: 'tshirts' },
      { name: 'Vintage Band Tee', description: 'Retro rock band graphic print', price: 34.99, stock: 75, categorySlug: 'tshirts' },
      { name: 'Striped Sailor Tee', description: 'Navy and white horizontal stripes', price: 39.99, stock: 60, categorySlug: 'tshirts' },
      { name: 'Oversized Black Tee', description: 'Relaxed fit heavyweight cotton', price: 44.99, stock: 80, categorySlug: 'tshirts' },
      { name: 'Pocket Henley Tee', description: 'Three-button henley with chest pocket', price: 37.99, stock: 55, categorySlug: 'tshirts' },
      // Dresses
      { name: 'Summer Floral Dress', description: 'Lightweight A-line with floral print', price: 69.99, stock: 40, categorySlug: 'dresses' },
      { name: 'Little Black Dress', description: 'Timeless cocktail dress', price: 89.99, stock: 35, categorySlug: 'dresses' },
      { name: 'Linen Midi Dress', description: 'Breathable linen with side pockets', price: 79.99, stock: 30, categorySlug: 'dresses' },
      { name: 'Wrap Dress', description: 'Adjustable wrap with V-neckline', price: 74.99, stock: 45, categorySlug: 'dresses' },
      { name: 'Maxi Boho Dress', description: 'Floor-length with embroidered details', price: 94.99, stock: 25, categorySlug: 'dresses' },
      // Shoes
      { name: 'White Leather Sneakers', description: 'Minimalist leather low-tops', price: 119.99, stock: 50, categorySlug: 'shoes' },
      { name: 'Canvas Slip-Ons', description: 'Easy-on casual canvas shoes', price: 49.99, stock: 90, categorySlug: 'shoes' },
      { name: 'Leather Chelsea Boots', description: 'Classic elastic-side ankle boots', price: 159.99, stock: 30, categorySlug: 'shoes' },
      { name: 'Running Shoes', description: 'Lightweight mesh with cushioned sole', price: 99.99, stock: 65, categorySlug: 'shoes' },
      { name: 'Suede Loafers', description: 'Soft suede with leather sole', price: 129.99, stock: 40, categorySlug: 'shoes' },
      // Accessories
      { name: 'Leather Belt', description: 'Full-grain leather with brass buckle', price: 45.99, stock: 100, categorySlug: 'accessories' },
      { name: 'Wool Beanie', description: 'Ribbed knit merino wool', price: 24.99, stock: 120, categorySlug: 'accessories' },
      { name: 'Canvas Tote Bag', description: 'Heavy-duty canvas with leather handles', price: 54.99, stock: 70, categorySlug: 'accessories' },
      // Outerwear
      { name: 'Denim Jacket', description: 'Classic trucker style denim', price: 89.99, stock: 45, categorySlug: 'outerwear' },
      { name: 'Puffer Vest', description: 'Lightweight down-filled vest', price: 109.99, stock: 35, categorySlug: 'outerwear' },
      { name: 'Wool Overcoat', description: 'Tailored double-breasted wool blend', price: 199.99, stock: 20, categorySlug: 'outerwear' },
    ];

    for (const product of products) {
      await queryRunner.query(
        `INSERT INTO products (id, name, description, price, stock, "categoryId", "purchaseCount", "isDeleted", version, "salePrice", "saleStartsAt", "saleEndsAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, 1, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          getCategoryId(product.categorySlug),
          Math.floor(Math.random() * 50),
          // ~30% of products on sale
          Math.random() < 0.3 ? (product.price * 0.7).toFixed(2) : null,
          Math.random() < 0.3 ? new Date() : null,
          Math.random() < 0.3 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        ],
      );
    }
    console.log(`Seeded ${products.length} products`);

    // --- Promo Codes ---
    const promoCodes = [
      {
        code: 'SEASON20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 50,
        maxUses: 100,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'WELCOME10',
        discountType: 'FIXED',
        discountValue: 10,
        minOrderAmount: 30,
        maxUses: null,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FREESHIP',
        discountType: 'FIXED',
        discountValue: 5.99,
        minOrderAmount: 0,
        maxUses: 500,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const promo of promoCodes) {
      await queryRunner.query(
        `INSERT INTO promo_codes (id, code, "discountType", "discountValue", "minOrderAmount", "maxUses", "currentUses", "startsAt", "expiresAt", "isActive", version)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 0, $6, $7, true, 1)
         ON CONFLICT (code) DO NOTHING`,
        [promo.code, promo.discountType, promo.discountValue, promo.minOrderAmount, promo.maxUses, promo.startsAt, promo.expiresAt],
      );
    }
    console.log(`Seeded ${promoCodes.length} promo codes`);

    // --- Users ---
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      { email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
      { email: 'manager@test.com', firstName: 'Manager', lastName: 'User', role: 'MANAGER' },
      { email: 'user@test.com', firstName: 'Test', lastName: 'User', role: 'USER' },
    ];

    for (const user of users) {
      await queryRunner.query(
        `INSERT INTO users (id, email, "passwordHash", "firstName", "lastName", role)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [user.email, passwordHash, user.firstName, user.lastName, user.role],
      );
    }
    console.log(`Seeded ${users.length} users (password: password123)`);

    await queryRunner.commitTransaction();
    console.log('Seed completed successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Seed failed:', error);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed();

