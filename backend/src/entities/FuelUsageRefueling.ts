import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fuel_usage_refueling')
@Index(['tenant_id', 'external_id'], { unique: true })
@Index(['tenant_id', 'refueling_date'])
export class FuelUsageRefueling {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  tenant_id!: number;

  @Column({ type: 'varchar', length: 255 })
  external_id!: string;

  @Column({ type: 'date' })
  refueling_date!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  equipment_id?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  equipment_name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  driver_name?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fuel_type?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  liters?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_liter?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_cost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  odometer?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hour_meter?: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  supplier?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  data_hash?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
