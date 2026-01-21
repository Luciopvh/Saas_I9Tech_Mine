import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('equipment_configuration')
@Index(['tenant_id', 'external_id'], { unique: true })
@Index(['tenant_id', 'equipment_code'])
export class EquipmentConfiguration {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  tenant_id!: number;

  @Column({ type: 'varchar', length: 255 })
  external_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  equipment_code?: string;

  @Column({ type: 'varchar', length: 500 })
  equipment_name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  equipment_type?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  equipment_group?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model?: string;

  @Column({ type: 'integer', nullable: true })
  manufacturing_year?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  serial_number?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tank_capacity?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expected_average_consumption?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  current_hour_meter?: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'date', nullable: true })
  acquisition_date?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  acquisition_value?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  worksite?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cost_center?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  data_hash?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
