# 🗄️ Database Migrations - Guia Completo

Este guia explica como criar e executar migrations do banco de dados.

---

## 📋 **O que são Migrations?**

Migrations são scripts SQL versionados que criam/modificam o schema do banco de dados de forma controlada.

**Vantagens**:
- ✅ Controle de versão do schema
- ✅ Reversível (rollback)
- ✅ Replicável em ambientes
- ✅ Evita `synchronize: true` em produção

---

## 🎯 **Estratégia Atual**

### **Desenvolvimento** (Local):
```typescript
synchronize: true  // TypeORM cria tabelas automaticamente
```

### **Produção** (Render):
```typescript
synchronize: false  // Usa migrations manualmente
```

---

## 📦 **Arquivos Disponíveis**

### **1. Migration TypeORM**
📄 `backend/src/migrations/1704531600000-InitialSchema.ts`

**O que faz**:
- Cria todas as 7 tabelas
- Cria todos os índices
- Cria constraints (foreign keys, unique)
- Função `up()` cria schema
- Função `down()` reverte schema

### **2. Script SQL Direto**
📄 `backend/database-schema.sql`

**O que faz**:
- SQL puro (compatível PostgreSQL/SQL Server)
- Cria tabelas + índices + constraints
- Cria views (estatísticas)
- Cria triggers (updated_at automático)
- Cria funções helper
- Queries de verificação

---

## 🚀 **Como Usar**

### **Opção 1: TypeORM Migration (Recomendado para Node.js)**

#### **1. Executar migration**

```bash
cd backend

# Produção (Render)
npm run migration:run

# Ou diretamente
npx typeorm migration:run -d src/data-source.ts
```

#### **2. Reverter migration**

```bash
npm run migration:revert

# Ou diretamente
npx typeorm migration:revert -d src/data-source.ts
```

#### **3. Gerar nova migration (após mudar entidades)**

```bash
npm run migration:generate -- -n AddNewTable

# Ou diretamente
npx typeorm migration:generate src/migrations/AddNewTable -d src/data-source.ts
```

---

### **Opção 2: Script SQL Direto (Manual)**

#### **1. Via psql (PostgreSQL)**

```bash
# Local
psql -U postgres -d tacweb_integration -f backend/database-schema.sql

# Render (usando URL do PostgreSQL)
psql "postgresql://user:pass@host/db" -f backend/database-schema.sql
```

#### **2. Via PgAdmin**

1. Conecte ao banco
2. Abra Query Tool
3. Cole conteúdo de `database-schema.sql`
4. Execute (F5)

#### **3. Via Render Dashboard**

1. Acesse seu PostgreSQL no Render
2. Clique em **"Connect"** → **"External Connection"**
3. Use as credenciais para conectar via psql
4. Execute o script

---

## 🔧 **Configuração para Produção (Render)**

### **Passo 1: Desabilitar synchronize**

Em `backend/src/data-source.ts`:

```typescript
const baseOptions = {
  synchronize: process.env.NODE_ENV === "development", // ✅ Já configurado
  // ...
};
```

### **Passo 2: Executar migration no deploy**

#### **Opção A: Script de inicialização** (Recomendado)

Criar `backend/init-db.sh`:

```bash
#!/bin/bash
set -e

echo "🔄 Running database migrations..."
npm run migration:run

echo "✅ Database initialized successfully"
```

Atualizar `package.json`:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "start:prod": "npm run migration:run && npm start"
  }
}
```

No Render, usar:
```
Start Command: npm run start:prod
```

#### **Opção B: Executar manualmente via Shell**

No Render Dashboard:

1. Acesse seu Web Service
2. Clique em **"Shell"** (menu lateral)
3. Execute:
```bash
npm run migration:run
```

---

## 📊 **Tabelas Criadas**

| # | Tabela | Descrição |
|---|--------|-----------|
| 1 | `tenants` | Clientes/empresas |
| 2 | `tenant_credentials` | Credenciais criptografadas |
| 3 | `tenant_endpoint_settings` | Config de endpoints |
| 4 | `integration_jobs` | Histórico de execuções |
| 5 | `integration_job_logs` | Logs detalhados |
| 6 | `fuel_usage_utilization` | Dados consumo (Item 04) |
| 7 | `fuel_usage_equipment` | Dados consumo (Item 07) |

**Índices**: 15+ índices para performance  
**Constraints**: Foreign keys + Unique constraints  
**Views**: 2 views para relatórios  
**Triggers**: 5 triggers para updated_at  

---

## 🔍 **Verificar Schema**

### **Verificar tabelas criadas**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Resultado esperado**:
```
fuel_usage_equipment
fuel_usage_utilization
integration_job_logs
integration_jobs
tenant_credentials
tenant_endpoint_settings
tenants
```

### **Verificar constraints**

```sql
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name;
```

### **Verificar índices**

```sql
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🆕 **Criar Nova Migration**

Quando você adicionar/modificar entidades:

### **1. Modificar entidade**

```typescript
// src/entities/Tenant.ts
@Entity("tenants")
export class Tenant {
  // ... campos existentes
  
  @Column({ nullable: true })  // NOVO CAMPO
  phone: string;
}
```

### **2. Gerar migration automaticamente**

```bash
npm run migration:generate -- -n AddPhoneToTenant

# TypeORM compara entidades com banco e gera diff
```

### **3. Revisar migration gerada**

```typescript
// src/migrations/170453xxxx-AddPhoneToTenant.ts
export class AddPhoneToTenant170453xxxx implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      ADD "phone" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      DROP COLUMN "phone"
    `);
  }
}
```

### **4. Executar migration**

```bash
npm run migration:run
```

---

## 🐛 **Troubleshooting**

### **Erro: "Table already exists"**

**Causa**: `synchronize: true` criou tabelas antes da migration.

**Solução**:
```sql
-- Dropar tabelas e recriar via migration
DROP TABLE IF EXISTS fuel_usage_equipment CASCADE;
DROP TABLE IF EXISTS fuel_usage_utilization CASCADE;
DROP TABLE IF EXISTS integration_job_logs CASCADE;
DROP TABLE IF EXISTS integration_jobs CASCADE;
DROP TABLE IF EXISTS tenant_endpoint_settings CASCADE;
DROP TABLE IF EXISTS tenant_credentials CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Depois executar migration
```

### **Erro: "Migration already executed"**

**Causa**: TypeORM rastreia migrations em `migrations` table.

**Solução 1** (Resetar rastreamento):
```sql
DELETE FROM migrations WHERE name = 'InitialSchema1704531600000';
```

**Solução 2** (Forçar execução):
```bash
# Usar script SQL direto em vez de TypeORM migration
psql -f database-schema.sql
```

### **Erro: "Cannot connect to database"**

**Causa**: Variáveis de ambiente incorretas.

**Solução**:
```bash
# Verificar .env
cat .env | grep DB_

# Testar conexão
psql "postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE"
```

---

## 📋 **Checklist de Deploy (Render)**

### **Primeira vez (setup inicial)**:

- [ ] PostgreSQL criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] `synchronize: false` em produção
- [ ] Migration executada via Shell ou script
- [ ] Tabelas verificadas (7 tabelas)
- [ ] Backend iniciado com sucesso

### **Próximas deploys (com novas migrations)**:

- [ ] Nova migration gerada localmente
- [ ] Commitada no Git
- [ ] Pushada para GitHub
- [ ] Deploy no Render
- [ ] Migration executada via Shell
- [ ] Verificar schema atualizado

---

## 🎯 **Recomendações**

### ✅ **Faça**:
- Use migrations em produção
- Versione migrations no Git
- Teste migrations localmente primeiro
- Sempre crie função `down()` (rollback)
- Documente mudanças de schema

### ❌ **Não Faça**:
- `synchronize: true` em produção
- Modificar migrations já executadas
- Deletar migrations do Git
- Executar SQL manual em prod (use migrations)

---

## 📚 **Comandos Úteis**

```bash
# Ver status das migrations
npm run typeorm migration:show -d src/data-source.ts

# Criar migration vazia
npm run typeorm migration:create src/migrations/CustomChanges

# Reverter última migration
npm run migration:revert

# Reverter todas as migrations
npm run typeorm schema:drop -d src/data-source.ts
```

---

## 🔗 **Recursos**

- **TypeORM Migrations**: https://typeorm.io/migrations
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Render PostgreSQL**: https://render.com/docs/databases

---

**Última atualização**: 2025-01-06  
**Status**: ✅ Migrations criadas e prontas para uso
