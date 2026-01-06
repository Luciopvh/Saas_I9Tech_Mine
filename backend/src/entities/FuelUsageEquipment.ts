import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("fuel_usage_equipment")
@Index(["tenant_id", "external_id"], { unique: true })
export class FuelUsageEquipment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  tenant_id: string;

  @Column({ type: "varchar", length: 255 })
  external_id: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  equipamento_id: string;

  @Column({ type: "timestamp", nullable: true })
  periodo_inicio: Date;

  @Column({ type: "timestamp", nullable: true })
  periodo_fim: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  litros: number;

  @Column({ type: "int", default: 0 })
  abastecimentos: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  consumo_medio: number;

  @Column({ type: "timestamp", nullable: true })
  source_timestamp: Date;

  @CreateDateColumn({ type: "timestamp" })
  ingested_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "text", nullable: true })
  raw_data: string;
}
