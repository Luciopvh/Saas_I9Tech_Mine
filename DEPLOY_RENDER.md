# 🚀 Guia Completo de Deploy no Render

Este guia detalha o processo passo a passo para fazer deploy da aplicação Tacweb Integration no Render.

## 📋 Pré-requisitos

- [x] Código no GitHub (repositório público ou privado)
- [x] Conta no [Render](https://render.com) (gratuita)
- [ ] Credenciais da API Tacweb para testes

## 🎯 Arquitetura no Render

```
┌─────────────────────────────────────────────────────┐
│                   Render Services                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Static Site │  │  Web Service │  │ Worker 1  │ │
│  │  (Frontend)  │→ │   (Backend)  │← │ (Worker)  │ │
│  │  React + MUI │  │   Express    │  │  BullMQ   │ │
│  └──────────────┘  └───────┬──────┘  └─────┬─────┘ │
│                            │                 │       │
│                            ↓                 ↓       │
│                    ┌───────────────┐  ┌───────────┐ │
│                    │  PostgreSQL   │  │   Redis   │ │
│                    │  (Database)   │  │  (Queue)  │ │
│                    └───────────────┘  └───────────┘ │
│                            ↑                 ↑       │
│                            │                 │       │
│                      ┌─────┴─────────────────┤       │
│                      │  Worker 2 (Scheduler) │       │
│                      │  Cron Jobs            │       │
│                      └───────────────────────┘       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 📦 Ordem de Deploy

1. PostgreSQL Database
2. Redis Instance
3. Backend Web Service
4. Worker (Consumers)
5. Scheduler (Cron)
6. Frontend Static Site

---

## 1️⃣ PostgreSQL Database

### Criar Database

1. Acesse: https://dashboard.render.com/new/database
2. Configure:
   ```
   Name: tacweb-integration-db
   Database: tacweb_integration
   User: postgres (padrão)
   Region: Oregon (US West) ou Frankfurt (Europe Central)
   PostgreSQL Version: 15
   Datadog API Key: (deixe em branco)
   Plan: Free ou Starter
   ```

3. Clique em **Create Database**

### Aguardar Provisioning

- Status: Creating → Available (1-2 minutos)
- Quando disponível, você verá as conexões

### Copiar Informações de Conexão

Você verá algo como:

```
Internal Database URL:
postgresql://tacweb_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com/tacweb_integration_db

External Database URL:
postgresql://tacweb_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com/tacweb_integration_db

PSQL Command:
PGPASSWORD=abc123xyz psql -h dpg-xxxxx-a.oregon-postgres.render.com -U tacweb_user tacweb_integration_db
```

**⚠️ IMPORTANTE**: Copie a **Internal Database URL** para usar nos próximos passos.

### Testar Conexão (Opcional)

Se tiver PostgreSQL instalado localmente:

```bash
psql "postgresql://tacweb_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com/tacweb_integration_db"

# Dentro do psql:
\l              # Listar databases
\q              # Sair
```

---

## 2️⃣ Redis Instance

### Criar Redis

1. Acesse: https://dashboard.render.com/new/redis
2. Configure:
   ```
   Name: tacweb-integration-redis
   Region: Mesma do PostgreSQL
   Plan: Free (25MB, suficiente para teste)
   Maxmemory Policy: allkeys-lru
   ```

3. Clique em **Create Redis**

### Aguardar Provisioning

- Status: Creating → Available (30-60 segundos)

### Copiar Informações de Conexão

Você verá:

```
Internal Redis URL:
redis://red-xxxxx:6379

External Redis URL:
redis://red-xxxxx.oregon.render.com:6379
```

**⚠️ IMPORTANTE**: Copie a **Internal Redis URL** para usar nos próximos passos.

---

## 3️⃣ Backend Web Service

### Criar Web Service

1. Acesse: https://dashboard.render.com/create?type=web
2. Conecte seu repositório GitHub:
   - Clique em **Connect account**
   - Autorize o Render
   - Selecione o repositório do projeto

3. Configure:
   ```
   Name: tacweb-integration-backend
   Region: Mesma anterior (Oregon ou Frankfurt)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Starter ($7/mês) ou Free (com limitações)
   ```

### Configurar Environment Variables

Clique em **Advanced** e adicione as variáveis:

```bash
# ===== BASIC =====
NODE_ENV=production
PORT=3000

# ===== DATABASE (cole Internal Database URL do Passo 1) =====
# Formato: postgresql://user:pass@host:5432/database
DATABASE_URL=<sua_internal_database_url>

# Parse manual (extrair do DATABASE_URL acima):
DB_TYPE=postgres
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=tacweb_user
DB_PASSWORD=<extrair_do_database_url>
DB_DATABASE=tacweb_integration_db

# ===== REDIS (cole Internal Redis URL do Passo 2) =====
# Formato: redis://host:6379
REDIS_URL=<sua_internal_redis_url>
REDIS_HOST=red-xxxxx
REDIS_PORT=6379
REDIS_PASSWORD=

# ===== SECURITY (GERE NOVOS!) =====
# Gere strings aleatórias em: https://randomkeygen.com/
JWT_SECRET=<gerar_string_aleatoria_32_caracteres>
ENCRYPTION_KEY=<gerar_string_aleatoria_32_caracteres>

# ===== TACWEB API =====
TACWEB_BASE_URL=https://api.tacweb.com.br
TACWEB_RATE_LIMIT_PER_MINUTE=30

# ===== LOGGING =====
LOG_LEVEL=info
```

### Deploy

4. Clique em **Create Web Service**
5. Aguarde build e deploy (3-5 minutos)
6. Status: Building → Live

### Testar Backend

Quando o status for **Live**, acesse:

```bash
# Health check
curl https://tacweb-integration-backend.onrender.com/health

# Resposta esperada:
# {"status":"ok","timestamp":"2025-01-06T...","uptime":12.345}

# Listar tenants (deve retornar array vazio inicialmente)
curl https://tacweb-integration-backend.onrender.com/api/tenants

# Resposta esperada:
# []
```

**⚠️ Copie a URL do backend** para usar no frontend.

---

## 4️⃣ Worker (Background Worker)

### Criar Background Worker

1. Acesse: https://dashboard.render.com/create?type=worker
2. Conecte o MESMO repositório GitHub

3. Configure:
   ```
   Name: tacweb-integration-worker
   Region: Mesma anterior
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run worker
   Plan: Starter ou Free
   ```

### Configurar Environment Variables

Clique em **Advanced** e adicione **EXATAMENTE AS MESMAS** variáveis do Passo 3 (Backend).

**Dica**: Copie e cole todas as variáveis do Web Service anterior.

### Deploy

4. Clique em **Create Background Worker**
5. Aguarde build e deploy (3-5 minutos)
6. Status: Building → Live

### Verificar Logs

Quando o status for **Live**, clique em **Logs** e verifique:

```
✅ Connected to Redis
✅ Database connection established successfully
✅ Integration worker started
```

---

## 5️⃣ Scheduler (Background Worker)

### Criar Background Worker

1. Acesse: https://dashboard.render.com/create?type=worker
2. Conecte o MESMO repositório GitHub

3. Configure:
   ```
   Name: tacweb-integration-scheduler
   Region: Mesma anterior
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run scheduler
   Plan: Starter ou Free
   ```

### Configurar Environment Variables

Copie **TODAS** as variáveis do Passo 3, e adicione:

```bash
RUN_ON_STARTUP=true
```

### Deploy

4. Clique em **Create Background Worker**
5. Aguarde build e deploy (3-5 minutos)
6. Status: Building → Live

### Verificar Logs

Quando o status for **Live**, clique em **Logs** e verifique:

```
✅ Connected to Redis
✅ Database connection established successfully
✅ Job scheduler started (runs every hour at minute 0)
Running initial job scheduling...
Found 0 active tenants
Job scheduling completed
```

---

## 6️⃣ Frontend Static Site

### Criar Static Site

1. Acesse: https://dashboard.render.com/create?type=static
2. Conecte o MESMO repositório GitHub

3. Configure:
   ```
   Name: tacweb-integration-frontend
   Region: Qualquer (static sites são CDN global)
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

### Configurar Environment Variables

```bash
VITE_API_URL=https://tacweb-integration-backend.onrender.com
```

**⚠️ IMPORTANTE**: Cole a URL exata do seu backend do Passo 3.

### Deploy

4. Clique em **Create Static Site**
5. Aguarde build e deploy (2-3 minutos)
6. Status: Building → Live

### Testar Frontend

Quando o status for **Live**, você verá a URL:

```
https://tacweb-integration-frontend.onrender.com
```

Acesse no navegador e verifique:
- [ ] Interface Material UI carrega
- [ ] Navegação funciona
- [ ] Console sem erros (F12)

---

## ✅ Verificação Final

### Checklist de Deploy

- [ ] PostgreSQL: Status **Available**
- [ ] Redis: Status **Available**
- [ ] Backend: Status **Live** + health check retorna 200
- [ ] Worker: Status **Live** + logs mostram "worker started"
- [ ] Scheduler: Status **Live** + logs mostram "scheduler started"
- [ ] Frontend: Status **Live** + carrega no navegador

### Teste End-to-End

1. **Criar um Tenant**:

```bash
curl -X POST https://tacweb-integration-backend.onrender.com/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Teste",
    "email": "teste@example.com",
    "status": "active"
  }'
```

Resposta esperada (copie o `id`):
```json
{
  "id": "uuid-aqui",
  "name": "Empresa Teste",
  "email": "teste@example.com",
  "status": "active",
  "created_at": "2025-01-06T...",
  "updated_at": "2025-01-06T..."
}
```

2. **Criar Credenciais** (substitua `<tenant_id>` e `<seu_token>`):

```bash
curl -X POST https://tacweb-integration-backend.onrender.com/api/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "<tenant_id>",
    "provider": "tacweb",
    "base_url": "https://api.tacweb.com.br",
    "auth_type": "bearer",
    "token": "<seu_token_tacweb>"
  }'
```

3. **Configurar Endpoint**:

```bash
curl -X POST https://tacweb-integration-backend.onrender.com/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "<tenant_id>",
    "endpoint_name": "fuel_usage_utilization",
    "enabled": true,
    "window_hours": 24,
    "rate_limit_per_minute": 30
  }'
```

4. **Trigger Manual** (forçar execução agora):

```bash
curl -X POST https://tacweb-integration-backend.onrender.com/api/scheduler/trigger
```

5. **Verificar Jobs**:

```bash
curl https://tacweb-integration-backend.onrender.com/api/jobs
```

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"

**Causa**: Variáveis de banco incorretas

**Solução**:
1. Vá em PostgreSQL → Info → Copie Internal Database URL
2. Backend → Environment → Atualize `DATABASE_URL` e variáveis `DB_*`
3. Clique em **Manual Deploy** → **Clear build cache & deploy**

### Erro: "Redis connection error"

**Causa**: Variáveis de Redis incorretas

**Solução**:
1. Vá em Redis → Info → Copie Internal Redis URL
2. Worker/Scheduler → Environment → Atualize `REDIS_URL` e `REDIS_HOST`
3. Clique em **Manual Deploy**

### Worker/Scheduler não inicia

**Causa**: `npm run worker` ou `npm run scheduler` falha

**Solução**:
1. Verifique Logs do service
2. Confirme que `package.json` tem os scripts corretos
3. Teste localmente: `cd backend && npm run worker`

### Frontend não conecta ao backend

**Causa**: `VITE_API_URL` incorreta

**Solução**:
1. Frontend → Environment → Verifique `VITE_API_URL`
2. Deve ser a URL EXATA do backend (com `https://`)
3. Re-deploy: **Manual Deploy** → **Clear build cache & deploy**

### Jobs não executam automaticamente

**Causa**: Scheduler não está rodando ou sem tenants/endpoints ativos

**Solução**:
1. Scheduler → Logs → Verifique "scheduler started"
2. Confirme que tenants têm status "active"
3. Confirme que endpoints estão `enabled: true`
4. Force execução: `curl -X POST .../api/scheduler/trigger`

---

## 💰 Custos Estimados (Render)

### Opção 1: Free Tier (Desenvolvimento)
- PostgreSQL: Free (90 dias, depois $7/mês)
- Redis: Free (25MB)
- Backend: Free (750h/mês, suspende após 15min inativo)
- Worker: Free (750h/mês)
- Scheduler: Free (750h/mês)
- Frontend: Free (100GB bandwidth/mês)

**Total**: $0/mês (depois $7/mês só PostgreSQL)

⚠️ **Limitações Free**:
- Backend suspende após 15min inativo (reinicia em ~30s)
- Workers podem ter delays
- PostgreSQL expira após 90 dias

### Opção 2: Starter (Produção Leve)
- PostgreSQL: Starter $7/mês
- Redis: Free (25MB suficiente)
- Backend: Starter $7/mês (sempre ativo)
- Worker: Starter $7/mês (sempre ativo)
- Scheduler: Starter $7/mês (sempre ativo)
- Frontend: Free

**Total**: $28/mês

✅ **Recomendado para produção** com até 50 tenants.

### Opção 3: Professional (Produção Escalável)
- PostgreSQL: Standard $20/mês
- Redis: Starter $10/mês
- Backend: Standard $25/mês
- Worker: Standard $25/mês (2 instâncias)
- Scheduler: Standard $25/mês
- Frontend: Free

**Total**: $130/mês

Para 100+ tenants com alta disponibilidade.

---

## 🔄 Atualizações Futuras

### Deploy Automático (CI/CD)

Render detecta automaticamente pushes no GitHub:

```bash
git add .
git commit -m "Update: nova feature"
git push origin main
```

Render automaticamente:
1. Detecta mudanças em `backend/` ou `frontend/`
2. Faz build
3. Deploy (zero-downtime para Web Services)

### Rollback

Se algo der errado:
1. Acesse o service no Dashboard
2. Clique em **Events**
3. Encontre deploy anterior
4. Clique em **Rollback to this version**

---

## 📞 Suporte

### Render Support
- Docs: https://render.com/docs
- Status: https://status.render.com
- Community: https://community.render.com

### Logs
- Acesse cada service → **Logs** tab
- Logs em tempo real dos últimos 7 dias

---

**Última atualização**: 2025-01-06  
**Status**: ✅ Pronto para deploy  
**Tempo estimado**: 30-45 minutos para deploy completo
