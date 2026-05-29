import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '@ecommerce/shared-types';
import type { ShippingAddress } from '@ecommerce/shared-types';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  giftCardAmountUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stripeChargeAmount: number; // totalAmount - discountAmount - giftCardAmountUsed

  @Column({ length: 50, nullable: true })
  promoCodeUsed: string | null;

  @Column({ length: 20, nullable: true })
  giftCardCodeUsed: string | null;

  @Column({ type: 'jsonb' })
  shippingAddress: ShippingAddress;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



