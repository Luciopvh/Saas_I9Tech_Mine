import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1704531600000 implements MigrationInterface {
    name = 'InitialSchema1704531600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tenants table
        await queryRunner.query(`
            CREATE TABLE "tenants" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "email" varchar(100),
                "status" varchar(50) NOT NULL DEFAULT 'active',
                "notes" text,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now()
            )
        `);

        // Create tenant_credentials table
        await queryRunner.query(`
            CREATE TABLE "tenant_credentials" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "tenant_id" uuid NOT NULL,
                "provider" varchar(100) NOT NULL,
                "base_url" varchar(500) NOT NULL,
                "auth_type" varchar(50) NOT NULL,
                "client_id" varchar(255),
                "client_secret_encrypted" text,
                "token_encrypted" text,
                "token_expires_at" timestamp,
                "scopes" varchar(500),
                "api_key_encrypted" varchar(255),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "fk_tenant_credentials_tenant" FOREIGN KEY ("tenant_id") 
                    REFERENCES "tenants"("id") ON DELETE CASCADE
            )
        `);

        // Create tenant_endpoint_settings table
        await queryRunner.query(`
            CREATE TABLE "tenant_endpoint_settings" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "tenant_id" uuid NOT NULL,
                "endpoint_name" varchar(100) NOT NULL,
                "enabled" boolean NOT NULL DEFAULT true,
                "window_hours" integer NOT NULL DEFAULT 24,
                "last_checkpoint" text,
                "rate_limit_per_minute" integer NOT NULL DEFAULT 30,
                "cron_schedule" varchar(50),
                "priority" integer NOT NULL DEFAULT 0,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "fk_tenant_endpoint_settings_tenant" FOREIGN KEY ("tenant_id") 
                    REFERENCES "tenants"("id") ON DELETE CASCADE
            )
        `);

        // Create integration_jobs table
        await queryRunner.query(`
            CREATE TABLE "integration_jobs" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "tenant_id" uuid NOT NULL,
                "endpoint_name" varchar(100) NOT NULL,
                "started_at" timestamp NOT NULL,
                "finished_at" timestamp,
                "status" varchar(50) NOT NULL DEFAULT 'pending',
                "fetched_count" integer NOT NULL DEFAULT 0,
                "upserted_count" integer NOT NULL DEFAULT 0,
                "failed_count" integer NOT NULL DEFAULT 0,
                "error_message" text,
                "metadata" text,
                "retry_count" integer NOT NULL DEFAULT 0,
                "created_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "fk_integration_jobs_tenant" FOREIGN KEY ("tenant_id") 
                    REFERENCES "tenants"("id") ON DELETE CASCADE
            )
        `);

        // Create integration_job_logs table
        await queryRunner.query(`
            CREATE TABLE "integration_job_logs" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "job_id" uuid NOT NULL,
                "level" varchar(20) NOT NULL,
                "message" text NOT NULL,
                "context_json" text,
                "created_at" timestamp NOT NULL DEFAULT now()
            )
        `);

        // Create fuel_usage_utilization table
        await queryRunner.query(`
            CREATE TABLE "fuel_usage_utilization" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "tenant_id" uuid NOT NULL,
                "external_id" varchar(255) NOT NULL,
                "equipamento_id" varchar(255),
                "obra_id" varchar(255),
                "periodo_inicio" timestamp,
                "periodo_fim" timestamp,
                "litros" decimal(10,2) NOT NULL DEFAULT 0,
                "horas_trabalhadas" decimal(10,2) NOT NULL DEFAULT 0,
                "consumo_por_hora" decimal(10,2) NOT NULL DEFAULT 0,
                "source_timestamp" timestamp,
                "ingested_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                "raw_data" text,
                CONSTRAINT "uq_fuel_usage_utilization_tenant_external" 
                    UNIQUE ("tenant_id", "external_id")
            )
        `);

        // Create fuel_usage_equipment table
        await queryRunner.query(`
            CREATE TABLE "fuel_usage_equipment" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "tenant_id" uuid NOT NULL,
                "external_id" varchar(255) NOT NULL,
                "equipamento_id" varchar(255),
                "periodo_inicio" timestamp,
                "periodo_fim" timestamp,
                "litros" decimal(10,2) NOT NULL DEFAULT 0,
                "abastecimentos" integer NOT NULL DEFAULT 0,
                "consumo_medio" decimal(10,2) NOT NULL DEFAULT 0,
                "source_timestamp" timestamp,
                "ingested_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                "raw_data" text,
                CONSTRAINT "uq_fuel_usage_equipment_tenant_external" 
                    UNIQUE ("tenant_id", "external_id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_tenants_status" ON "tenants" ("status")`);
        await queryRunner.query(`CREATE INDEX "idx_tenant_credentials_tenant" ON "tenant_credentials" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "idx_tenant_endpoint_settings_tenant" ON "tenant_endpoint_settings" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "idx_integration_jobs_tenant" ON "integration_jobs" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "idx_integration_jobs_status" ON "integration_jobs" ("status")`);
        await queryRunner.query(`CREATE INDEX "idx_integration_jobs_endpoint" ON "integration_jobs" ("endpoint_name")`);
        await queryRunner.query(`CREATE INDEX "idx_fuel_usage_utilization_tenant" ON "fuel_usage_utilization" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "idx_fuel_usage_equipment_tenant" ON "fuel_usage_equipment" ("tenant_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_fuel_usage_equipment_tenant"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_fuel_usage_utilization_tenant"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_integration_jobs_endpoint"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_integration_jobs_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_integration_jobs_tenant"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_tenant_endpoint_settings_tenant"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_tenant_credentials_tenant"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_tenants_status"`);

        // Drop tables (reverse order due to foreign keys)
        await queryRunner.query(`DROP TABLE IF EXISTS "fuel_usage_equipment"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "fuel_usage_utilization"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "integration_job_logs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "integration_jobs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tenant_endpoint_settings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tenant_credentials"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tenants"`);
    }
}
