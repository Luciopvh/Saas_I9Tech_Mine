import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("integration_job_logs")
export class IntegrationJobLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  job_id: string;

  @Column({ type: "varchar", length: 20 })
  level: string; // info, warn, error

  @Column({ type: "text" })
  message: string;

  @Column({ type: "text", nullable: true })
  context_json: string; // JSON com dados adicionais

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}
