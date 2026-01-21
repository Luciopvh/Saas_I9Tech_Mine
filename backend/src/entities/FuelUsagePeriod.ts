import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fuel_usage_period')
@Index(['tenant_id', 'external_id'], { unique: true })
@Index(['tenant_id', 'period_type', 'period_start'])
export class FuelUsagePeriod {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  tenant_id!: number;

  @Column({ type: 'varchar', length: 255 })
  external_id!: string;

  @Column({ type: 'varchar', length: 50 })
  period_type!: string; // daily, weekly, monthly

  @Column({ type: 'date' })
  period_start!: string;

  @Column({ type: 'date' })
  period_end!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_liters?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_cost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_hours?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  average_consumption_per_hour?: number;

  @Column({ type: 'integer', nullable: true })
  equipment_count?: number;

  @Column({ type: 'integer', nullable: true })
  refueling_count?: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  data_hash?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
