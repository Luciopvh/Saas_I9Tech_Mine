import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Tenant } from "./Tenant";

@Entity("tenant_credentials")
export class TenantCredentials {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  tenant_id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.credentials, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ type: "varchar", length: 100 })
  provider: string; // tacweb

  @Column({ type: "varchar", length: 500 })
  base_url: string;

  @Column({ type: "varchar", length: 50 })
  auth_type: string; // bearer, basic, api_key

  @Column({ type: "varchar", length: 255, nullable: true })
  client_id: string;

  @Column({ type: "text", nullable: true })
  client_secret_encrypted: string; // Encrypted

  @Column({ type: "text", nullable: true })
  token_encrypted: string; // Encrypted

  @Column({ type: "timestamp", nullable: true })
  token_expires_at: Date;

  @Column({ type: "varchar", length: 500, nullable: true })
  scopes: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  api_key_encrypted: string; // Encrypted

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
