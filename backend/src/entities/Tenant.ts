import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { TenantCredentials } from "./TenantCredentials";
import { TenantEndpointSettings } from "./TenantEndpointSettings";
import { IntegrationJob } from "./IntegrationJob";

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  email: string;

  @Column({ type: "varchar", length: 50, default: "active" })
  status: string; // active, inactive, suspended

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  // Relations
  @OneToMany(() => TenantCredentials, (credentials) => credentials.tenant)
  credentials: TenantCredentials[];

  @OneToMany(() => TenantEndpointSettings, (settings) => settings.tenant)
  endpoint_settings: TenantEndpointSettings[];

  @OneToMany(() => IntegrationJob, (job) => job.tenant)
  jobs: IntegrationJob[];
}
