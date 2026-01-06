import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Tenant } from "./Tenant";

@Entity("tenant_endpoint_settings")
export class TenantEndpointSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  tenant_id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.endpoint_settings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ type: "varchar", length: 100 })
  endpoint_name: string; // fuel_usage_utilization, fuel_usage_equipment, etc

  @Column({ type: "boolean", default: true })
  enabled: boolean;

  @Column({ type: "int", default: 24 })
  window_hours: number; // Janela de coleta em horas

  @Column({ type: "text", nullable: true })
  last_checkpoint: string; // JSON com estado da última coleta

  @Column({ type: "int", default: 30 })
  rate_limit_per_minute: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  cron_schedule: string; // Ex: "0 * * * *" (a cada hora)

  @Column({ type: "int", default: 0 })
  priority: number; // Prioridade de execução

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
