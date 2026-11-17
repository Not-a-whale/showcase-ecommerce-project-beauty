import styles from './CollectionBanner.module.scss';

export function CollectionBanner({ title }: { title: string }) {
  return (
    <section className={styles.banner}>
      <h1 className={styles.title}>{title}</h1>
    </section>
  );
}
