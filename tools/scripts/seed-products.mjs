import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LEGACY_DIR = path.join(ROOT, 'Beauty-main', 'assets');
const PUBLIC_DIR = path.join(ROOT, 'apps', 'web', 'public', 'products');
const DATA_FILE = path.join(ROOT, 'tools', 'scripts', 'data', 'fragrancenet.psv');
const CDN = 'https://cdn.fragrancenet.com/images/photos';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const CATEGORIES = [
  { slug: 'skin-care', name: 'Skin care' },
  { slug: 'make-up', name: 'Make up' },
  { slug: 'hair-care', name: 'Hair care' },
  { slug: 'fragrance', name: 'Fragrance' },
  { slug: 'body-care', name: 'Body care' },
];

const SECTION_TO_CATEGORY = {
  fragrance: 'fragrance',
  skincare: 'skin-care',
  makeup: 'make-up',
  haircare: 'hair-care',
  body: 'body-care',
};

const PRICE_RANGE = {
  fragrance: [39, 220],
  'skin-care': [19, 180],
  'make-up': [15, 120],
  'hair-care': [12, 60],
  'body-care': [12, 60],
};

const LEGACY = [
  { name: 'Bright Blush Powder', category: 'make-up', price: 32.95, salePrice: 21.95, images: ['img/just_dropped/0/0.jpg', 'img/just_dropped/0/1.jpg'], description: "Sheer and buildable, 'Free Soul' is a pale-pink powder infused with light-catching particles for a natural glow. Healthy-looking colour that instantly enlivens the complexion." },
  { name: 'Luxe Face Cream', category: 'skin-care', price: 30, images: ['img/just_dropped/1/0.jpg', 'img/just_dropped/1/1.jpg'], description: 'A rich daily moisturiser with hyaluronic acid and shea butter. Sourced, tried and tested — one of the most innovative heroes out there.' },
  { name: 'Astro Space Lipstick', category: 'make-up', price: 30, images: ['img/just_dropped/2/0.jpg', 'img/just_dropped/2/1.jpg', 'img/just_dropped/2/2.jpg'], description: 'Triple Luxe formula: long lasting, natural and moisturising. Enriched with avocado, jojoba oils and vitamins C and E for deep hydration and a smooth, supple finish.' },
  { name: 'Sera Perfume', category: 'fragrance', price: 65, images: ['img/just_dropped/3/0.jpg', 'img/just_dropped/3/1.jpg', 'img/just_dropped/3/2.jpg'], description: 'A mellow, sensual perfume: gardenia and apricot blossom open with tangerine, blackcurrant and freesia, then flow into a heart of jasmine and Bulgarian rose.' },
  { name: 'Bloom No.2', category: 'fragrance', price: 65, salePrice: 52, images: ['img/just_dropped/4/0.jpg', 'img/just_dropped/4/1.jpg', 'img/just_dropped/4/2.jpg'], description: 'A luminous floral eau de parfum — peony, white tea and a soft musk base. Light enough for daytime, memorable enough for evening.' },
  { name: 'Oat and Juniper Hand Cream', category: 'body-care', price: 30, images: ['img/just_dropped/5/0.jpg', 'img/just_dropped/5/1.jpg', 'img/just_dropped/5/2.jpg'], description: 'Fast-absorbing hand cream with colloidal oat and juniper berry. Softens dry, hard-working hands without a greasy film.' },
  { name: 'Base Concealer', category: 'make-up', price: 20, images: ['img/just_dropped/6/0.jpg', 'img/just_dropped/6/1.jpg'], description: 'Buildable, medium-coverage concealer with knotgrass extract to help reduce the appearance of fine lines. Click-pen design with a brush applicator.' },
  { name: 'Base Concealer Light', category: 'make-up', price: 15, salePrice: 12, images: ['img/just_dropped/7/0.jpg', 'img/just_dropped/7/1.jpg'], description: 'The lighter shade of our best-selling concealer. Covers dark circles and redness, leaves skin looking firmer and more even.' },
];

const BLURB = {
  fragrance: {
    w: 'A signature scent with lasting sillage, made to be noticed without overpowering.',
    m: 'A confident, long-lasting scent that works from the office to late evening.',
    u: 'A clean, versatile scent that suits everyone, every day.',
  },
  'skin-care': 'Dermatologist-tested and suitable for daily use on all skin types.',
  'make-up': 'Richly pigmented, blendable colour that lasts all day without weighing the skin down.',
  'hair-care': 'Visibly healthier, shinier hair from the very first wash.',
  'body-care': 'Everyday care that leaves skin soft, smooth and comfortable.',
};

const BODY_RE = /body lotion|shower gel|body wash|bath |body cream|body oil|hand cream|hand & nail|body butter|scrub|deodorant|anti ?perspirant|soap|body mist|body spray|body milk|body care/i;

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function hashInt(value, mod) {
  return parseInt(createHash('md5').update(String(value)).digest('hex').slice(0, 8), 16) % mod;
}

function nice(value) {
  return Math.max(1, Math.ceil(value)) - 0.01;
}

function clamp(value, [min, max]) {
  return Math.min(max, Math.max(min, value));
}

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bDe\b/g, 'de')
    .replace(/\bEdp\b/g, 'EDP')
    .replace(/\bEdt\b/g, 'EDT');
}

function cleanDescription(text) {
  return text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s-\s.*$/, '')
    .replace(/\s*\/.*$/, '')
    .replace(/\b\d+(\.\d+)?\s?(ml|oz|g|fl)\b/gi, ' ')
    .replace(/\s+--.*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function buildName(row) {
  const { section, designer, brand, description } = row;
  if (section === 'fragrance' || section === 'body') {
    const words = designer.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const lower = brand.toLowerCase();
    let base = words.some((w) => lower.includes(w)) ? brand : `${designer} ${brand}`;
    base = base.replace(/^Dolce & Gabbana D & G /, 'Dolce & Gabbana ');
    return `${base} ${titleCase(description)}`.replace(/\s{2,}/g, ' ').trim();
  }
  const desc = cleanDescription(description);
  return desc.toLowerCase().startsWith(designer.toLowerCase()) ? desc : `${designer} ${desc}`;
}

const SKIP_RE = /variety|piece|\bset\b|\bkit\b|duo\b|&.*&/i;

function loadRows() {
  return readFileSync(DATA_FILE, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [section, sku, designer, brand, description, gender, price, saving, flags] = line.split('|');
      return { section, sku, designer, brand, description, gender, price: Number(price), saving: Number(saving), flags };
    })
    .filter((r) => !SKIP_RE.test(r.description) && !/fragrancenet/i.test(`${r.designer} ${r.brand}`));
}

function loadEnv() {
  const envFile = path.join(ROOT, '.env');
  const raw = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const seen = new Map();

async function download(url, dest) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: controller.signal });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2500) return null;
    const digest = createHash('md5').update(buf).digest('hex');
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    return digest;
  } catch (err) {
    console.warn(`  ! ${url}: ${err.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchImages(row, slug) {
  const [legacy, bottle, boxBottle, promo1] = row.flags.split('').map((c) => c === '1');
  const candidates = [];
  if (legacy) candidates.push({ url: `${CDN}/600x600/${row.sku}.jpg`, ext: 'jpg' });
  if (promo1) candidates.push({ url: `${CDN}/promo1/600x600/${row.sku}.jpg`, ext: 'jpg' });
  if (boxBottle) candidates.push({ url: `${CDN}/box-bottle/600x600/${row.sku}.png`, ext: 'png' });
  if (bottle) candidates.push({ url: `${CDN}/bottle/600x600/${row.sku}.png`, ext: 'png' });

  const files = [];
  const digests = new Set();
  for (const { url, ext } of candidates) {
    if (files.length === 2) break;
    const dest = path.join(PUBLIC_DIR, slug, `${files.length + 1}.${ext}`);
    const digest = await download(url, dest);
    if (!digest) continue;
    if (digests.has(digest)) {
      await rm(dest, { force: true });
      continue;
    }
    digests.add(digest);
    files.push(`/products/${slug}/${files.length + 1}.${ext}`);
  }
  return files;
}

async function collect() {
  await rm(PUBLIC_DIR, { recursive: true, force: true });
  await mkdir(PUBLIC_DIR, { recursive: true });

  const products = [];
  const manifest = {};
  const usedSlugs = new Set();
  const uniqueSlug = (base) => {
    let slug = base;
    let i = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${i++}`;
    usedSlugs.add(slug);
    return slug;
  };

  console.log('• legacy products');
  for (const item of LEGACY) {
    const slug = uniqueSlug(slugify(item.name));
    const files = [];
    for (const [i, rel] of item.images.entries()) {
      const src = path.join(LEGACY_DIR, rel);
      if (!existsSync(src)) continue;
      const dest = path.join(PUBLIC_DIR, slug, `${i + 1}.jpg`);
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(src, dest);
      files.push(`/products/${slug}/${i + 1}.jpg`);
    }
    products.push({
      ...item,
      slug,
      images: files,
      stock: 20 + hashInt(slug, 60),
      purchaseCount: 200 + hashInt(slug + 'p', 500),
    });
    manifest[slug] = files;
  }

  const rows = loadRows();
  console.log(`• FragranceNet products: ${rows.length}`);
  const usedNames = new Set(products.map((p) => p.name));
  let done = 0;
  for (const row of rows) {
    const category =
      row.section !== 'fragrance' && BODY_RE.test(row.description)
        ? 'body-care'
        : SECTION_TO_CATEGORY[row.section];
    const audience = { w: 'for women', m: 'for men', u: 'unisex' }[row.gender] ?? '';
    let name = buildName(row);
    if (name.length > 75) continue;
    if (usedNames.has(name) && audience) name = `${name} ${titleCase(audience)}`;
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    const slug = uniqueSlug(slugify(name));
    const images = await fetchImages(row, slug);
    done += 1;
    if (done % 20 === 0) console.log(`  ${done}/${rows.length}`);
    if (images.length === 0) {
      console.warn(`  ! no images for ${name}, skipped`);
      continue;
    }

    const retail = row.saving > 0 ? row.price / (1 - row.saving / 100) : row.price * 1.35;
    const price = nice(clamp(retail, PRICE_RANGE[category]));
    const onSale = hashInt(row.sku + 's', 100) < 30;
    const salePrice = onSale ? nice(price * (0.7 + hashInt(row.sku + 'd', 16) / 100)) : undefined;
    const blurb =
      category === 'fragrance' ? BLURB.fragrance[row.gender] ?? BLURB.fragrance.u : BLURB[category];
    const description =
      category === 'fragrance'
        ? `${row.brand} by ${row.designer} — ${titleCase(row.description)} ${audience}. ${blurb}`
        : `${cleanDescription(row.description)} by ${row.designer}. ${blurb}`;

    products.push({
      name,
      category,
      price,
      salePrice,
      description: description.replace(/\s{2,}/g, ' '),
      slug,
      images,
      stock: 5 + hashInt(row.sku + 'q', 80),
      purchaseCount: hashInt(row.sku + 'p', 1200),
    });
    manifest[slug] = images;
  }

  await writeFile(path.join(PUBLIC_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
  return products;
}

async function seed(products) {
  const env = loadEnv();
  const client = new pg.Client({
    host: env.DATABASE_HOST ?? 'localhost',
    port: Number(env.DATABASE_PORT ?? 5432),
    user: env.DATABASE_USER ?? 'ecommerce',
    password: env.DATABASE_PASSWORD ?? 'ecommerce_pass',
    database: env.DATABASE_NAME ?? 'ecommerce',
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE order_items, orders, wishlists, products, categories CASCADE');

    const categoryIds = {};
    for (const c of CATEGORIES) {
      const { rows } = await client.query(
        'INSERT INTO categories (id, name, slug) VALUES (gen_random_uuid(), $1, $2) RETURNING id',
        [c.name, c.slug],
      );
      categoryIds[c.slug] = rows[0].id;
    }

    const base = Date.now();
    const saleStart = new Date(base - 7 * 86400000);
    const saleEnd = new Date(base + 30 * 86400000);

    for (const [i, p] of products.entries()) {
      const createdAt = new Date(base - (products.length - i) * 3600000 - hashInt(p.slug, 3600000));
      await client.query(
        `INSERT INTO products
           (id, name, description, price, stock, "imageUrl", images, "isDeleted", "purchaseCount",
            "salePrice", "saleStartsAt", "saleEndsAt", version, "categoryId", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, $7, $8, $9, $10, 1, $11, $12, $12)`,
        [
          p.name,
          p.description,
          p.price,
          p.stock,
          p.images[0] ?? null,
          p.images,
          p.purchaseCount,
          p.salePrice ?? null,
          p.salePrice ? saleStart : null,
          p.salePrice ? saleEnd : null,
          categoryIds[p.category],
          createdAt,
        ],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

const products = await collect();
const byCategory = products.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] ?? 0) + 1 }), {});
console.log(`\n${products.length} products, ${products.filter((p) => p.salePrice).length} on sale`, byCategory);
await seed(products);
console.log('Database seeded.');
