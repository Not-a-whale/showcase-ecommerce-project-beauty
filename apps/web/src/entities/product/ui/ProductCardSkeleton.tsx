import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import styles from './ProductCardSkeleton.module.scss';

export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <Skeleton className={styles.image} />
      <Skeleton className={styles.name} />
      <Skeleton className={styles.price} />
    </div>
  );
}
