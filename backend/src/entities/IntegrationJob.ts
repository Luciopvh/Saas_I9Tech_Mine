import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Tenant } from "./Tenant";

@Entity("integration_jobs")
export class IntegrationJob {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  tenant_id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.jobs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ type: "varchar", length: 100 })
  endpoint_name: string;

  @Column({ type: "timestamp" })
  started_at: Date;

  @Column({ type: "timestamp", nullable: true })
  finished_at: Date;

  @Column({ type: "varchar", length: 50, default: "pending" })
  status: string; // pending, running, success, failed, partial

  @Column({ type: "int", default: 0 })
  fetched_count: number;

  @Column({ type: "int", default: 0 })
  upserted_count: number;

  @Column({ type: "int", default: 0 })
  failed_count: number;

  @Column({ type: "text", nullable: true })
  error_message: string;

  @Column({ type: "text", nullable: true })
  metadata: string; // JSON com informações adicionais

  @Column({ type: "int", default: 0 })
  retry_count: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}
