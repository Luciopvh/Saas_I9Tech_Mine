# 🛠️ Guia de Desenvolvimento Local

Este guia explica como configurar o ambiente de desenvolvimento local.

## 📋 Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop/))
- Git ([Download](https://git-scm.com/))
- VS Code (recomendado) ([Download](https://code.visualstudio.com/))

## 🚀 Setup Inicial

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/tacweb-integration.git
cd tacweb-integration
```

### 2. Iniciar Banco de Dados e Redis (Docker)

```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f
```

**Serviços iniciados**:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### 3. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env conforme necessário
# (valores padrão já funcionam com docker-compose)
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar .env (opcional)
echo "VITE_API_URL=http://localhost:3000" > .env
```

## 🎯 Executar Aplicação

### Opção 1: Executar Tudo Separadamente (Desenvolvimento)

**Terminal 1 - Backend API**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Worker**:
```bash
cd backend
npm run worker
```

**Terminal 3 - Scheduler**:
```bash
cd backend
npm run scheduler
```

**Terminal 4 - Frontend**:
```bash
cd frontend
npm run dev
```

Acesse:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health: http://localhost:3000/health

### Opção 2: Usar tmux/screen (Linux/Mac)

```bash
# Criar sessão tmux
tmux new -s tacweb

# Janela 1: Backend
cd backend && npm run dev

# Ctrl+B, C (criar nova janela)
# Janela 2: Worker
cd backend && npm run worker

# Ctrl+B, C
# Janela 3: Scheduler
cd backend && npm run scheduler

# Ctrl+B, C
# Janela 4: Frontend
cd frontend && npm run dev

# Navegar entre janelas: Ctrl+B, número
# Detach: Ctrl+B, D
# Reattach: tmux attach -t tacweb
```

## 🔧 Comandos Úteis

### Backend

```bash
cd backend

# Desenvolvimento com auto-reload
npm run dev

# Build para produção
npm run build

# Executar build
npm start

# TypeORM migrations
npm run migration:generate -- -n NomeDaMigration
npm run migration:run
npm run migration:revert
```

### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

### Docker

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v

# Logs em tempo real
docker-compose logs -f

# Acessar PostgreSQL
docker exec -it tacweb-postgres psql -U postgres -d tacweb_integration

# Acessar Redis CLI
docker exec -it tacweb-redis redis-cli
```

## 🗄️ Banco de Dados

### Conectar ao PostgreSQL

```bash
# Via Docker
docker exec -it tacweb-postgres psql -U postgres -d tacweb_integration

# Via psql local
psql postgresql://postgres:postgres@localhost:5432/tacweb_integration
```

### Comandos psql úteis

```sql
-- Listar tabelas
\dt

-- Descrever tabela
\d tenants

-- Ver dados
SELECT * FROM tenants;
SELECT * FROM integration_jobs ORDER BY started_at DESC LIMIT 10;

-- Limpar dados
TRUNCATE integration_jobs, integration_job_logs CASCADE;

-- Sair
\q
```

### Resetar banco de dados

```bash
# Parar e remover volumes
docker-compose down -v

# Reiniciar
docker-compose up -d

# Backend criará as tabelas automaticamente
# (synchronize: true no desenvolvimento)
```

## 🧪 Testes

### Testar API com curl

```bash
# Health check
curl http://localhost:3000/health

# Criar tenant
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Local",
    "email": "teste@local.dev",
    "status": "active"
  }'

# Listar tenants
curl http://localhost:3000/api/tenants
```

### Testar com Postman/Insomnia

Importe a collection:
- URL: http://localhost:3000
- Endpoints: Ver `API_EXAMPLES.md`

### Testes de integração (futuro)

```bash
cd backend
npm test
```

## 🐛 Debugging

### VS Code Launch Configurations

Crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend API",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "preLaunchTask": "tsc: build - backend/tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Worker",
      "program": "${workspaceFolder}/backend/src/workers/integrationWorker.ts",
      "preLaunchTask": "tsc: build - backend/tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

### Logs

```bash
# Backend logs estão em backend/logs/
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

### Redis Monitoring

```bash
# Conectar ao Redis
docker exec -it tacweb-redis redis-cli

# Monitorar comandos
MONITOR

# Ver filas
KEYS bull:integration:*

# Ver jobs na fila
LRANGE bull:integration:wait 0 -1

# Limpar fila
FLUSHDB
```

## 🔐 Credenciais de Teste

Se você tiver credenciais Tacweb de teste, configure:

```bash
cd backend

# Criar tenant
TENANT_ID=$(curl -s -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Tacweb",
    "email": "teste@tacweb.com",
    "status": "active"
  }' | jq -r '.id')

# Criar credenciais
curl -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_ID\",
    \"provider\": \"tacweb\",
    \"base_url\": \"https://api.tacweb.com.br\",
    \"auth_type\": \"bearer\",
    \"token\": \"SEU_TOKEN_AQUI\"
  }"

# Ativar endpoint
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_ID\",
    \"endpoint_name\": \"fuel_usage_utilization\",
    \"enabled\": true,
    \"window_hours\": 24
  }"

# Trigger manual
curl -X POST http://localhost:3000/api/scheduler/trigger

# Ver jobs
curl http://localhost:3000/api/jobs
```

## 📚 Estrutura de Arquivos

```
tacweb-integration/
├── backend/
│   ├── src/
│   │   ├── connectors/      # Conectores da API Tacweb
│   │   ├── entities/        # Modelos TypeORM
│   │   ├── queue/           # Configuração BullMQ
│   │   ├── routes/          # Rotas Express
│   │   ├── scheduler/       # Agendador cron
│   │   ├── utils/           # Utilitários (encryption, logger)
│   │   ├── workers/         # Workers BullMQ
│   │   ├── data-source.ts   # Config TypeORM
│   │   └── server.ts        # App Express
│   ├── logs/                # Logs gerados
│   ├── .env                 # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml       # PostgreSQL + Redis
├── .gitignore
├── README.md
├── DEVELOPMENT.md           # Este arquivo
├── DEPLOY_RENDER.md         # Deploy Render
└── API_EXAMPLES.md          # Exemplos de uso
```

## 🔄 Workflow de Desenvolvimento

### Adicionar novo endpoint Tacweb

1. **Criar entidade** em `backend/src/entities/`:
   ```typescript
   // FuelUsageByPeriod.ts
   @Entity("fuel_usage_period")
   export class FuelUsageByPeriod {
     // campos...
   }
   ```

2. **Criar conector** em `backend/src/connectors/`:
   ```typescript
   // FuelUsageByPeriodConnector.ts
   export class FuelUsageByPeriodConnector extends BaseConnector {
     // implementar métodos
   }
   ```

3. **Registrar no Factory**:
   ```typescript
   // ConnectorFactory.ts
   case "fuel_usage_period":
     return new FuelUsageByPeriodConnector(context);
   ```

4. **Adicionar em `routes/endpoints.ts`**:
   ```typescript
   { name: "fuel_usage_period", label: "Consumo por Período", item: 6 }
   ```

5. **Testar**:
   ```bash
   npm run dev
   # Criar endpoint settings e trigger
   ```

### Fazer commit

```bash
git add .
git commit -m "feat: adicionar endpoint fuel_usage_period"
git push origin main
```

## 🚨 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"

```bash
# Verificar se está rodando
docker-compose ps

# Reiniciar
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

### Erro: "Redis connection refused"

```bash
# Verificar se está rodando
docker-compose ps

# Reiniciar
docker-compose restart redis
```

### Erro: "Port 3000 already in use"

```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=3001 npm run dev
```

### Tabelas não criadas

```bash
# Verificar .env
cat backend/.env | grep DB_

# Forçar sincronização
# Em data-source.ts, temporariamente:
synchronize: true,

# Reiniciar backend
npm run dev
```

### Worker não processa jobs

```bash
# Verificar Redis
docker exec -it tacweb-redis redis-cli ping

# Ver logs do worker
cd backend && npm run worker

# Ver fila no Redis
docker exec -it tacweb-redis redis-cli
> KEYS bull:integration:*
```

## 📞 Suporte

- Issues: https://github.com/seu-usuario/tacweb-integration/issues
- Documentação: `README.md`, `API_EXAMPLES.md`
- API Tacweb: Manual WebService APIs Tacweb v1.9

---

**Última atualização**: 2025-01-06
