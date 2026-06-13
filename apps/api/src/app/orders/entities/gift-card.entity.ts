import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('gift_cards')
export class GiftCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  remainingAmount: number;

  @Column({ type: 'uuid', nullable: true })
  purchasedByUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  redeemedByUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  usedInOrderId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'purchasedByUserId' })
  purchasedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'redeemedByUserId' })
  redeemedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}

