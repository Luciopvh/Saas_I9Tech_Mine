# Tacweb Integration - Sistema Multi-Tenant

Sistema de integração multi-tenant para coleta horária de dados da API Tacweb, com backend Node.js + TypeORM + PostgreSQL e frontend React + Material UI.

## 📋 Visão Geral

### Funcionalidades Implementadas
- ✅ **CRUD de Tenants** - Gerenciamento de clientes/empresas
- ✅ **Gestão de Credenciais** - Armazenamento seguro (criptografado) de chaves API
- ✅ **Configuração de Endpoints** - Ativar/desativar 13 endpoints Tacweb por tenant
- ✅ **Sistema de Filas (BullMQ)** - Processamento assíncrono com reintentos
- ✅ **Agendador de Jobs** - Execução horária automatizada (cron)
- ✅ **Workers** - Consumidores de fila para coleta de dados
- ✅ **Conectores Tacweb** - 2 implementados (Utilização e Equipamento) + estrutura para 11 restantes
- ✅ **API REST** - Backend completo com logging e tratamento de erros
- ✅ **Frontend React + MUI** - Interface administrativa (estrutura básica)

### 13 Endpoints Tacweb (Itens 04-17 do Manual)

1. **fuel_usage_utilization** ✅ - Consumo por Utilização (implementado)
2. **fuel_usage_refueling** 🔜 - Consumo por Abastecimento
3. **fuel_usage_period** 🔜 - Consumo por Período
4. **fuel_usage_equipment** ✅ - Consumo por Equipamento (implementado)
5. **fuel_usage_worksite** 🔜 - Consumo por Obra
6. **fuel_usage_cost_center** 🔜 - Consumo por Centro de Custo
7. **fuel_usage_equipment_type** 🔜 - Consumo por Tipo de Equipamento
8. **fuel_usage_equipment_group** 🔜 - Consumo por Grupo de Equipamento
9. **fuel_usage_company** 🔜 - Consumo por Empresa
10. **fuel_usage_consolidated** 🔜 - Consumo Consolidado
11. **fuel_usage_driver** 🔜 - Consumo por Motorista/Operador
12. **fuel_usage_vehicle** 🔜 - Consumo por Veículo
13. **fuel_usage_fleet** 🔜 - Consumo por Frota
14. **equipment_configuration** 🔜 - Configuração de Equipamento

## 🏗️ Arquitetura

```
┌─────────────────┐
│  React Frontend │ (Material UI)
└────────┬────────┘
         │ HTTP
┌────────▼────────┐
│  Express API    │ (REST)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│  Redis│ │PostgreSQL│
│ (Fila)│ │  (Dados) │
└───┬───┘ └─────────┘
    │
┌───▼────────┐
│  Workers   │ ← BullMQ
│ (Consumers)│
└────────────┘
```

## 🚀 Deploy no Render

### Pré-requisitos
- Conta no [Render](https://render.com)
- Conta no GitHub (código já deve estar em repositório)

### Passo 1: Criar PostgreSQL Database

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **New** → **PostgreSQL**
3. Configure:
   - **Name**: `tacweb-integration-db`
   - **Database**: `tacweb_integration`
   - **User**: `postgres` (padrão)
   - **Region**: Escolha próximo ao Brasil
   - **Plan**: Free ou Starter
4. Clique em **Create Database**
5. Copie a **Internal Database URL** (formato: `postgresql://user:pass@host/db`)

### Passo 2: Criar Redis Instance

1. No Render Dashboard, clique em **New** → **Redis**
2. Configure:
   - **Name**: `tacweb-integration-redis`
   - **Region**: Mesma do PostgreSQL
   - **Plan**: Free (25MB) ou Starter
3. Clique em **Create Redis**
4. Copie a **Internal Redis URL** (formato: `redis://host:port`)

### Passo 3: Deploy do Backend (Web Service)

1. No Render Dashboard, clique em **New** → **Web Service**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `tacweb-integration-backend`
   - **Region**: Mesma anterior
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/mês) ou Free (limites)

4. **Environment Variables** (adicione):
   ```
   NODE_ENV=production
   PORT=3000
   
   # Database (cole a Internal Database URL do Passo 1)
   DB_TYPE=postgres
   DATABASE_URL=<sua_database_url_interna>
   
   # Parse Database URL automaticamente
   DB_HOST=<extrair_do_database_url>
   DB_PORT=5432
   DB_USERNAME=<extrair_do_database_url>
   DB_PASSWORD=<extrair_do_database_url>
   DB_DATABASE=tacweb_integration
   
   # Redis (cole a Internal Redis URL do Passo 2)
   REDIS_URL=<sua_redis_url_interna>
   REDIS_HOST=<extrair_do_redis_url>
   REDIS_PORT=6379
   
   # Security
   JWT_SECRET=<gerar_string_aleatoria_32_chars>
   ENCRYPTION_KEY=<gerar_string_aleatoria_32_chars>
   
   # Logging
   LOG_LEVEL=info
   ```

5. Clique em **Create Web Service**

### Passo 4: Deploy do Worker (Background Worker)

1. No Render Dashboard, clique em **New** → **Background Worker**
2. Conecte o mesmo repositório GitHub
3. Configure:
   - **Name**: `tacweb-integration-worker`
   - **Region**: Mesma anterior
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run worker`
   - **Plan**: Starter ou Free

4. **Environment Variables**: Copie TODAS as mesmas do Passo 3

5. Clique em **Create Background Worker**

### Passo 5: Deploy do Scheduler (Background Worker)

1. No Render Dashboard, clique em **New** → **Background Worker**
2. Conecte o mesmo repositório GitHub
3. Configure:
   - **Name**: `tacweb-integration-scheduler`
   - **Region**: Mesma anterior
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run scheduler`
   - **Plan**: Starter ou Free

4. **Environment Variables**: Copie TODAS as mesmas do Passo 3
5. Adicione variável adicional:
   ```
   RUN_ON_STARTUP=true
   ```

6. Clique em **Create Background Worker**

### Passo 6: Deploy do Frontend (Static Site)

1. No Render Dashboard, clique em **New** → **Static Site**
2. Conecte o mesmo repositório GitHub
3. Configure:
   - **Name**: `tacweb-integration-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://tacweb-integration-backend.onrender.com
   ```

5. Clique em **Create Static Site**

## 🔧 Desenvolvimento Local

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Edite .env com suas configurações locais

# Rodar migrações (se houver)
npm run migration:run

# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, iniciar worker
npm run worker

# Em outro terminal, iniciar scheduler
npm run scheduler
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

## 📊 Banco de Dados

### Entidades Principais

- **tenants** - Clientes/empresas
- **tenant_credentials** - Credenciais criptografadas
- **tenant_endpoint_settings** - Configuração de endpoints por tenant
- **integration_jobs** - Histórico de execuções
- **integration_job_logs** - Logs detalhados
- **fuel_usage_utilization** - Dados de consumo por utilização
- **fuel_usage_equipment** - Dados de consumo por equipamento
- (+ 11 tabelas para outros endpoints)

### Migração para SQL Server

Para migrar de PostgreSQL para SQL Server posteriormente:

1. Atualize `.env`:
   ```
   DB_TYPE=mssql
   DB_HOST=seu-servidor.database.windows.net
   DB_PORT=1433
   DB_USERNAME=seu_usuario
   DB_PASSWORD=sua_senha
   DB_DATABASE=tacweb_integration
   ```

2. O TypeORM automaticamente ajustará as queries

## 🔐 Segurança

- ✅ Credenciais criptografadas com AES-256-GCM
- ✅ Rate limiting na API
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado
- ✅ Variáveis sensíveis em .env (não commitadas)
- ✅ JWT para autenticação (estrutura pronta)

## 📝 API Endpoints

### Tenants
- `GET /api/tenants` - Listar todos
- `POST /api/tenants` - Criar novo
- `GET /api/tenants/:id` - Buscar por ID
- `PUT /api/tenants/:id` - Atualizar
- `DELETE /api/tenants/:id` - Deletar

### Credentials
- `GET /api/credentials/tenant/:tenantId` - Listar por tenant
- `POST /api/credentials` - Criar nova
- `PUT /api/credentials/:id` - Atualizar
- `DELETE /api/credentials/:id` - Deletar

### Endpoints
- `GET /api/endpoints/available` - Listar endpoints disponíveis
- `GET /api/endpoints/tenant/:tenantId` - Configurações por tenant
- `POST /api/endpoints` - Criar configuração
- `PUT /api/endpoints/:id` - Atualizar
- `PATCH /api/endpoints/:id/toggle` - Ativar/desativar
- `DELETE /api/endpoints/:id` - Deletar

### Jobs
- `GET /api/jobs` - Listar jobs (com filtros)
- `GET /api/jobs/:id` - Buscar por ID
- `GET /api/jobs/:id/logs` - Logs de um job
- `GET /api/jobs/stats/summary` - Estatísticas

### Scheduler
- `POST /api/scheduler/trigger` - Executar agendamento manualmente

## 🧪 Testando a API

### Criar um Tenant

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Teste Ltda",
    "email": "contato@empresateste.com.br",
    "status": "active"
  }'
```

### Criar Credenciais

```bash
curl -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "<tenant_id>",
    "provider": "tacweb",
    "base_url": "https://api.tacweb.com.br",
    "auth_type": "bearer",
    "token": "seu_token_aqui"
  }'
```

### Configurar Endpoint

```bash
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "<tenant_id>",
    "endpoint_name": "fuel_usage_utilization",
    "enabled": true,
    "window_hours": 24,
    "rate_limit_per_minute": 30
  }'
```

### Trigger Manual

```bash
curl -X POST http://localhost:3000/api/scheduler/trigger
```

## 📦 Estrutura do Projeto

```
webapp/
├── backend/
│   ├── src/
│   │   ├── connectors/          # Conectores Tacweb
│   │   ├── entities/            # Entidades TypeORM
│   │   ├── queue/               # BullMQ setup
│   │   ├── routes/              # REST API routes
│   │   ├── scheduler/           # Cron scheduler
│   │   ├── utils/               # Utilitários
│   │   ├── workers/             # Workers BullMQ
│   │   ├── data-source.ts       # TypeORM config
│   │   └── server.ts            # Express app
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/               # Páginas
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔄 Próximos Passos

### Para Produção
1. ✅ Implementar 11 conectores restantes (copiar padrão dos existentes)
2. ✅ Adicionar autenticação JWT no frontend
3. ✅ Implementar dashboards com gráficos (Recharts)
4. ✅ Adicionar testes unitários e integração
5. ✅ Configurar CI/CD com GitHub Actions
6. ✅ Implementar monitoramento com Sentry
7. ✅ Adicionar documentação Swagger/OpenAPI

### Para Implementar Conectores Restantes

Copie o padrão de `FuelUsageUtilizationConnector.ts` ou `FuelUsageEquipmentConnector.ts` e ajuste:

1. Endpoint da API Tacweb
2. Campos de normalização
3. Entidade TypeORM correspondente

## 📞 Suporte

Para dúvidas sobre a API Tacweb, consulte o **Manual WebService APIs Tacweb v1.9**.

## 📄 Licença

Projeto interno - Todos os direitos reservados

---

**Última atualização**: 2025-01-06
**Status**: ✅ Backend completo, Frontend estruturado, Pronto para deploy no Render
