'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../model/types';
import { formatPrice } from '@/shared/lib/format-price';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product, mediaEl: HTMLElement | null) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const href = `/product/${product.id}`;
  const effectivePrice = product.effectivePrice ?? product.price;
  const isOnSale = effectivePrice < product.price;
  const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const [primary, hover] = images;

  return (
    <article className={styles.card}>
      <div className={styles.imgContainer}>
        <Link href={href} className={styles.media} ref={mediaRef}>
          {primary ? (
            <>
              <Image
                src={primary}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.image}
              />
              {hover && (
                <Image
                  src={hover}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`${styles.image} ${styles.imageHover}`}
                />
              )}
            </>
          ) : (
            <div className={styles.placeholder} aria-hidden />
          )}
        </Link>

        {isOnSale && <span className={styles.badge}>Sale</span>}

        <button
          type="button"
          className={styles.add}
          aria-label="Add to cart"
          onClick={() => onAdd?.(product, mediaRef.current)}
        >
          <Image src="/icons/plus.svg" alt="" width={10} height={10} />
        </button>
      </div>

      <Link href={href} className={styles.titleLink}>
        <h4 className={styles.name}>{product.name}</h4>
      </Link>

      <div className={styles.price}>
        {isOnSale && (
          <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
        )}
        <span className={isOnSale ? styles.currentPrice : undefined}>
          {formatPrice(effectivePrice)}
        </span>
      </div>
    </article>
  );
}
