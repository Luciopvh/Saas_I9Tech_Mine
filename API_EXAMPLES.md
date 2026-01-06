# 📚 Exemplos de Uso da API

Exemplos práticos de como usar a API REST do sistema Tacweb Integration.

## 🔧 Base URL

**Local**: `http://localhost:3000`  
**Produção**: `https://tacweb-integration-backend.onrender.com`

---

## 1️⃣ Tenants (Clientes/Empresas)

### Criar novo tenant

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Construtora ABC Ltda",
    "email": "contato@construtorabc.com.br",
    "status": "active",
    "notes": "Cliente principal - contrato anual"
  }'
```

**Resposta**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Construtora ABC Ltda",
  "email": "contato@construtorabc.com.br",
  "status": "active",
  "notes": "Cliente principal - contrato anual",
  "created_at": "2025-01-06T10:30:00.000Z",
  "updated_at": "2025-01-06T10:30:00.000Z"
}
```

### Listar todos os tenants

```bash
curl http://localhost:3000/api/tenants
```

### Filtrar por status

```bash
curl "http://localhost:3000/api/tenants?status=active"
```

### Buscar tenant específico

```bash
curl http://localhost:3000/api/tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Atualizar tenant

```bash
curl -X PUT http://localhost:3000/api/tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive",
    "notes": "Cliente pausado temporariamente"
  }'
```

### Deletar tenant

```bash
curl -X DELETE http://localhost:3000/api/tenants/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 2️⃣ Credentials (Credenciais de API)

### Criar credenciais com Bearer Token

```bash
curl -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "provider": "tacweb",
    "base_url": "https://api.tacweb.com.br",
    "auth_type": "bearer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "scopes": "read:fuel write:fuel",
    "is_active": true
  }'
```

### Criar credenciais com API Key

```bash
curl -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "provider": "tacweb",
    "base_url": "https://api.tacweb.com.br",
    "auth_type": "api_key",
    "api_key": "sk_live_abc123def456ghi789",
    "is_active": true
  }'
```

### Criar credenciais com Basic Auth

```bash
curl -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "provider": "tacweb",
    "base_url": "https://api.tacweb.com.br",
    "auth_type": "basic",
    "client_id": "user123",
    "client_secret": "password456",
    "is_active": true
  }'
```

**⚠️ Nota**: Os valores `token`, `client_secret` e `api_key` são automaticamente **criptografados** antes de salvar no banco.

### Listar credenciais de um tenant

```bash
curl http://localhost:3000/api/credentials/tenant/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Resposta** (valores sensíveis mascarados):
```json
[
  {
    "id": "cred-123",
    "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "provider": "tacweb",
    "base_url": "https://api.tacweb.com.br",
    "auth_type": "bearer",
    "token_encrypted": "***",
    "is_active": true,
    "created_at": "2025-01-06T10:35:00.000Z"
  }
]
```

### Atualizar credenciais

```bash
curl -X PUT http://localhost:3000/api/credentials/cred-123 \
  -H "Content-Type: application/json" \
  -d '{
    "token": "novo_token_aqui",
    "is_active": true
  }'
```

---

## 3️⃣ Endpoint Settings (Configuração de Endpoints)

### Listar endpoints disponíveis

```bash
curl http://localhost:3000/api/endpoints/available
```

**Resposta**:
```json
[
  {
    "name": "fuel_usage_utilization",
    "label": "Consumo por Utilização",
    "item": 4
  },
  {
    "name": "fuel_usage_equipment",
    "label": "Consumo por Equipamento",
    "item": 7
  },
  // ... mais 11 endpoints
]
```

### Ativar endpoint para um tenant

```bash
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "endpoint_name": "fuel_usage_utilization",
    "enabled": true,
    "window_hours": 24,
    "rate_limit_per_minute": 30,
    "cron_schedule": "0 * * * *",
    "priority": 1
  }'
```

**Campos**:
- `window_hours`: Janela de tempo para coletar dados (últimas N horas)
- `rate_limit_per_minute`: Máximo de requisições por minuto para este endpoint
- `cron_schedule`: Agendamento cron (padrão: a cada hora)
- `priority`: Prioridade de execução (maior = executado primeiro)

### Listar configurações de um tenant

```bash
curl http://localhost:3000/api/endpoints/tenant/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Ativar múltiplos endpoints de uma vez

```bash
# Ativar endpoint de utilização
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "endpoint_name": "fuel_usage_utilization",
    "enabled": true,
    "window_hours": 24,
    "priority": 1
  }'

# Ativar endpoint de equipamento
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "endpoint_name": "fuel_usage_equipment",
    "enabled": true,
    "window_hours": 48,
    "priority": 2
  }'
```

### Toggle (ativar/desativar) endpoint

```bash
curl -X PATCH http://localhost:3000/api/endpoints/endpoint-id-123/toggle
```

### Atualizar configuração

```bash
curl -X PUT http://localhost:3000/api/endpoints/endpoint-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "window_hours": 48,
    "rate_limit_per_minute": 20
  }'
```

---

## 4️⃣ Jobs (Histórico de Execuções)

### Listar todos os jobs

```bash
curl http://localhost:3000/api/jobs
```

### Filtrar por tenant

```bash
curl "http://localhost:3000/api/jobs?tenant_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Filtrar por endpoint

```bash
curl "http://localhost:3000/api/jobs?endpoint_name=fuel_usage_utilization"
```

### Filtrar por status

```bash
# Status: pending, running, success, failed, partial
curl "http://localhost:3000/api/jobs?status=failed"
```

### Combinar filtros

```bash
curl "http://localhost:3000/api/jobs?tenant_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&status=success&limit=10"
```

### Buscar job específico

```bash
curl http://localhost:3000/api/jobs/job-id-123
```

**Resposta**:
```json
{
  "id": "job-id-123",
  "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "endpoint_name": "fuel_usage_utilization",
  "started_at": "2025-01-06T11:00:00.000Z",
  "finished_at": "2025-01-06T11:02:30.000Z",
  "status": "success",
  "fetched_count": 150,
  "upserted_count": 145,
  "failed_count": 5,
  "error_message": null,
  "retry_count": 0,
  "tenant": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Construtora ABC Ltda"
  }
}
```

### Buscar logs de um job

```bash
curl http://localhost:3000/api/jobs/job-id-123/logs
```

**Resposta**:
```json
[
  {
    "id": "log-1",
    "job_id": "job-id-123",
    "level": "info",
    "message": "Starting data collection",
    "context_json": "{\"endpoint\":\"fuel_usage_utilization\"}",
    "created_at": "2025-01-06T11:00:00.000Z"
  },
  {
    "id": "log-2",
    "level": "info",
    "message": "Data collection completed successfully",
    "context_json": "{\"fetched\":150,\"upserted\":145}",
    "created_at": "2025-01-06T11:02:30.000Z"
  }
]
```

### Estatísticas de jobs

```bash
curl http://localhost:3000/api/jobs/stats/summary
```

**Resposta**:
```json
{
  "total": 500,
  "success": 480,
  "failed": 15,
  "running": 2,
  "pending": 3
}
```

### Estatísticas por tenant

```bash
curl "http://localhost:3000/api/jobs/stats/summary?tenant_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

---

## 5️⃣ Scheduler (Agendador Manual)

### Forçar execução imediata

Força a execução de todos os jobs agendados (útil para testes):

```bash
curl -X POST http://localhost:3000/api/scheduler/trigger
```

**Resposta**:
```json
{
  "message": "Job scheduling triggered successfully"
}
```

**O que acontece**:
1. Busca todos os tenants ativos
2. Para cada tenant, busca endpoints habilitados
3. Adiciona jobs na fila do BullMQ
4. Workers processam os jobs

---

## 🔄 Fluxo Completo de Uso

### Setup Inicial de um Cliente

```bash
#!/bin/bash

# 1. Criar tenant
TENANT=$(curl -s -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa XYZ",
    "email": "contato@xyz.com.br",
    "status": "active"
  }')

TENANT_ID=$(echo $TENANT | jq -r '.id')
echo "Tenant criado: $TENANT_ID"

# 2. Criar credenciais
curl -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_ID\",
    \"provider\": \"tacweb\",
    \"base_url\": \"https://api.tacweb.com.br\",
    \"auth_type\": \"bearer\",
    \"token\": \"seu_token_aqui\"
  }"

# 3. Ativar endpoints
for endpoint in "fuel_usage_utilization" "fuel_usage_equipment"; do
  curl -X POST http://localhost:3000/api/endpoints \
    -H "Content-Type: application/json" \
    -d "{
      \"tenant_id\": \"$TENANT_ID\",
      \"endpoint_name\": \"$endpoint\",
      \"enabled\": true,
      \"window_hours\": 24
    }"
done

# 4. Trigger imediato
curl -X POST http://localhost:3000/api/scheduler/trigger

echo "Setup completo para tenant $TENANT_ID"
```

---

## 🐛 Testes e Debug

### Health Check

```bash
curl http://localhost:3000/health
```

### Verificar conexões

```bash
# Logs do backend
docker logs tacweb-backend

# Ou no Render: Dashboard → Service → Logs
```

### Testar autenticação Tacweb

```bash
# Substituir pelos valores reais
curl https://api.tacweb.com.br/api/consumo/utilizacao \
  -H "Authorization: Bearer seu_token_aqui"
```

---

## 📊 Monitoramento

### Jobs executando

```bash
# Jobs em execução
curl "http://localhost:3000/api/jobs?status=running"

# Jobs com erro
curl "http://localhost:3000/api/jobs?status=failed&limit=10"
```

### Performance por tenant

```bash
# Últimos 50 jobs de um tenant
curl "http://localhost:3000/api/jobs?tenant_id=TENANT_ID&limit=50"
```

---

## 🔐 Autenticação (Futura)

Quando autenticação JWT for implementada, adicione header:

```bash
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

**Última atualização**: 2025-01-06  
**Versão da API**: 1.0.0
