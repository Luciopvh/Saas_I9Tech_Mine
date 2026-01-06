-- ============================================
-- Tacweb Integration - Database Schema
-- PostgreSQL / SQL Server Compatible
-- ============================================

-- Enable UUID extension (PostgreSQL only)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TENANTS TABLE
-- ============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_status ON tenants(status);

COMMENT ON TABLE tenants IS 'Clientes/empresas multi-tenant';
COMMENT ON COLUMN tenants.status IS 'Status: active, inactive, suspended';

-- ============================================
-- 2. TENANT_CREDENTIALS TABLE
-- ============================================
CREATE TABLE tenant_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    provider VARCHAR(100) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    auth_type VARCHAR(50) NOT NULL,
    client_id VARCHAR(255),
    client_secret_encrypted TEXT,
    token_encrypted TEXT,
    token_expires_at TIMESTAMP,
    scopes VARCHAR(500),
    api_key_encrypted VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tenant_credentials_tenant 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_tenant_credentials_tenant ON tenant_credentials(tenant_id);

COMMENT ON TABLE tenant_credentials IS 'Credenciais criptografadas por tenant';
COMMENT ON COLUMN tenant_credentials.auth_type IS 'Tipos: bearer, basic, api_key';

-- ============================================
-- 3. TENANT_ENDPOINT_SETTINGS TABLE
-- ============================================
CREATE TABLE tenant_endpoint_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    endpoint_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    window_hours INTEGER NOT NULL DEFAULT 24,
    last_checkpoint TEXT,
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 30,
    cron_schedule VARCHAR(50),
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tenant_endpoint_settings_tenant 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_tenant_endpoint_settings_tenant ON tenant_endpoint_settings(tenant_id);
CREATE INDEX idx_tenant_endpoint_settings_enabled ON tenant_endpoint_settings(enabled);

COMMENT ON TABLE tenant_endpoint_settings IS 'Configuração de endpoints por tenant';
COMMENT ON COLUMN tenant_endpoint_settings.window_hours IS 'Janela de tempo para coleta (horas)';

-- ============================================
-- 4. INTEGRATION_JOBS TABLE
-- ============================================
CREATE TABLE integration_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    endpoint_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    fetched_count INTEGER NOT NULL DEFAULT 0,
    upserted_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    metadata TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_integration_jobs_tenant 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_integration_jobs_tenant ON integration_jobs(tenant_id);
CREATE INDEX idx_integration_jobs_status ON integration_jobs(status);
CREATE INDEX idx_integration_jobs_endpoint ON integration_jobs(endpoint_name);
CREATE INDEX idx_integration_jobs_started ON integration_jobs(started_at DESC);

COMMENT ON TABLE integration_jobs IS 'Histórico de execução de jobs';
COMMENT ON COLUMN integration_jobs.status IS 'Status: pending, running, success, failed, partial';

-- ============================================
-- 5. INTEGRATION_JOB_LOGS TABLE
-- ============================================
CREATE TABLE integration_job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integration_job_logs_job ON integration_job_logs(job_id);
CREATE INDEX idx_integration_job_logs_level ON integration_job_logs(level);

COMMENT ON TABLE integration_job_logs IS 'Logs detalhados por job';
COMMENT ON COLUMN integration_job_logs.level IS 'Níveis: info, warn, error';

-- ============================================
-- 6. FUEL_USAGE_UTILIZATION TABLE
-- ============================================
CREATE TABLE fuel_usage_utilization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    equipamento_id VARCHAR(255),
    obra_id VARCHAR(255),
    periodo_inicio TIMESTAMP,
    periodo_fim TIMESTAMP,
    litros DECIMAL(10,2) NOT NULL DEFAULT 0,
    horas_trabalhadas DECIMAL(10,2) NOT NULL DEFAULT 0,
    consumo_por_hora DECIMAL(10,2) NOT NULL DEFAULT 0,
    source_timestamp TIMESTAMP,
    ingested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    raw_data TEXT,
    
    CONSTRAINT uq_fuel_usage_utilization_tenant_external 
        UNIQUE (tenant_id, external_id)
);

CREATE INDEX idx_fuel_usage_utilization_tenant ON fuel_usage_utilization(tenant_id);
CREATE INDEX idx_fuel_usage_utilization_equipamento ON fuel_usage_utilization(equipamento_id);
CREATE INDEX idx_fuel_usage_utilization_periodo ON fuel_usage_utilization(periodo_inicio, periodo_fim);

COMMENT ON TABLE fuel_usage_utilization IS 'Consumo de combustível por utilização (Item 04)';

-- ============================================
-- 7. FUEL_USAGE_EQUIPMENT TABLE
-- ============================================
CREATE TABLE fuel_usage_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    equipamento_id VARCHAR(255),
    periodo_inicio TIMESTAMP,
    periodo_fim TIMESTAMP,
    litros DECIMAL(10,2) NOT NULL DEFAULT 0,
    abastecimentos INTEGER NOT NULL DEFAULT 0,
    consumo_medio DECIMAL(10,2) NOT NULL DEFAULT 0,
    source_timestamp TIMESTAMP,
    ingested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    raw_data TEXT,
    
    CONSTRAINT uq_fuel_usage_equipment_tenant_external 
        UNIQUE (tenant_id, external_id)
);

CREATE INDEX idx_fuel_usage_equipment_tenant ON fuel_usage_equipment(tenant_id);
CREATE INDEX idx_fuel_usage_equipment_equipamento ON fuel_usage_equipment(equipamento_id);
CREATE INDEX idx_fuel_usage_equipment_periodo ON fuel_usage_equipment(periodo_inicio, periodo_fim);

COMMENT ON TABLE fuel_usage_equipment IS 'Consumo de combustível por equipamento (Item 07)';

-- ============================================
-- VIEWS (OPTIONAL - FOR REPORTING)
-- ============================================

-- View: Estatísticas de jobs por tenant
CREATE OR REPLACE VIEW v_job_stats_by_tenant AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    COUNT(j.id) as total_jobs,
    COUNT(CASE WHEN j.status = 'success' THEN 1 END) as successful_jobs,
    COUNT(CASE WHEN j.status = 'failed' THEN 1 END) as failed_jobs,
    SUM(j.fetched_count) as total_fetched,
    SUM(j.upserted_count) as total_upserted,
    MAX(j.started_at) as last_job_at
FROM tenants t
LEFT JOIN integration_jobs j ON t.id = j.tenant_id
GROUP BY t.id, t.name;

COMMENT ON VIEW v_job_stats_by_tenant IS 'Estatísticas de jobs agregadas por tenant';

-- View: Endpoints ativos por tenant
CREATE OR REPLACE VIEW v_active_endpoints AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.status as tenant_status,
    tes.endpoint_name,
    tes.enabled,
    tes.window_hours,
    tes.rate_limit_per_minute,
    tes.last_checkpoint,
    tes.updated_at
FROM tenants t
INNER JOIN tenant_endpoint_settings tes ON t.id = tes.tenant_id
WHERE t.status = 'active' AND tes.enabled = TRUE
ORDER BY t.name, tes.priority DESC;

COMMENT ON VIEW v_active_endpoints IS 'Lista de endpoints ativos por tenant';

-- ============================================
-- FUNCTIONS (OPTIONAL - HELPER FUNCTIONS)
-- ============================================

-- Function: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER set_timestamp_tenants
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tenant_credentials
    BEFORE UPDATE ON tenant_credentials
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tenant_endpoint_settings
    BEFORE UPDATE ON tenant_endpoint_settings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_fuel_usage_utilization
    BEFORE UPDATE ON fuel_usage_utilization
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_fuel_usage_equipment
    BEFORE UPDATE ON fuel_usage_equipment
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- SEED DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Tenant de teste
INSERT INTO tenants (id, name, email, status, notes) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Empresa Teste', 'teste@example.com', 'active', 'Tenant de teste para desenvolvimento');

-- ============================================
-- GRANTS (OPTIONAL - FOR SECURITY)
-- ============================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- Verificar indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- END OF SCHEMA
-- ============================================
