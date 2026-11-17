import type { CSSProperties } from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ width, height, circle, className, style }: SkeletonProps) {
  const cls = [styles.skeleton, circle && styles.circle, className].filter(Boolean).join(' ');
  return (
    <span
      aria-hidden
      className={cls}
      style={{ inlineSize: width, blockSize: height, ...style }}
    />
  );
}
