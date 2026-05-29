import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'int', default: 0 })
  purchaseCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number | null;

  @Column({ type: 'timestamp', nullable: true })
  saleStartsAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  saleEndsAt: Date | null;

  @VersionColumn()
  version: number;

  @Index()
  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

