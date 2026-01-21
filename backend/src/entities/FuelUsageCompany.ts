import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fuel_usage_company')
@Index(['tenant_id', 'external_id'], { unique: true })
@Index(['tenant_id', 'company_code'])
export class FuelUsageCompany {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  tenant_id!: number;

  @Column({ type: 'varchar', length: 255 })
  external_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company_code?: string;

  @Column({ type: 'varchar', length: 500 })
  company_name!: string;

  @Column({ type: 'date', nullable: true })
  period_start?: string;

  @Column({ type: 'date', nullable: true })
  period_end?: string;

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

  @Column({ type: 'varchar', length: 64, nullable: true })
  data_hash?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
