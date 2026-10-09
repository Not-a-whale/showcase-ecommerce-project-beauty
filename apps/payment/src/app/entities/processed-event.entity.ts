import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvent {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  eventId: string;

  @Column({ type: 'varchar', length: 255 })
  eventType: string;

  @CreateDateColumn()
  processedAt: Date;
}
