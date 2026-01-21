# ⚡ Guia Rápido de Referência - API Tacweb

## 🎯 URLs dos 14 Endpoints

| # | Nome | URL | Status |
|---|------|-----|--------|
| 04 | Consumo por Utilização | `/consumo/utilizacao` | ✅ IMPLEMENTADO |
| 05 | Consumo por Abastecimento | `/consumo/abastecimento` | ✅ IMPLEMENTADO |
| 06 | Consumo por Período | `/consumo/periodo` | ✅ IMPLEMENTADO |
| 07 | Consumo por Equipamento | `/consumo/equipamento` | ✅ IMPLEMENTADO |
| 08 | Consumo por Obra | `/consumo/obra` | ✅ IMPLEMENTADO |
| 09 | Consumo por Centro de Custo | `/consumo/centro-custo` | ✅ IMPLEMENTADO |
| 10 | Consumo por Tipo de Equipamento | `/consumo/tipo-equipamento` | ✅ IMPLEMENTADO |
| 11 | Consumo por Grupo de Equipamento | `/consumo/grupo-equipamento` | ✅ IMPLEMENTADO |
| 12 | Consumo por Empresa | `/consumo/empresa` | ✅ IMPLEMENTADO |
| 13 | Consumo Consolidado | `/consumo/consolidado` | ✅ IMPLEMENTADO |
| 14 | Consumo por Motorista/Operador | `/consumo/motorista` | ✅ IMPLEMENTADO |
| 15 | Consumo por Veículo | `/consumo/veiculo` | ✅ IMPLEMENTADO |
| 16 | Consumo por Frota | `/consumo/frota` | ✅ IMPLEMENTADO |
| 17 | Configuração de Equipamento | `/configuracao/equipamento` | ✅ IMPLEMENTADO |

---

## 🔑 Autenticação Rápida

```bash
# Header obrigatório em todas as requisições
Authorization: Bearer SEU-TOKEN-JWT-AQUI
```

---

## 📊 Parâmetros Comuns

### Paginação (todos os endpoints)
```
?page=1&per_page=25
```

### Filtros de Data (maioria dos endpoints)
```
?data_inicio=2024-01-01&data_fim=2024-01-31
```

### Ordenação
```
?order_by=campo&order=asc|desc
```

---

## 🚀 Exemplos de Uso Rápido

### 1. Consumo por Utilização
```bash
curl -H "Authorization: Bearer TOKEN" \
"https://api.tacweb.com.br/consumo/utilizacao?page=1&data_inicio=2024-01-01"
```

### 2. Consumo por Equipamento
```bash
curl -H "Authorization: Bearer TOKEN" \
"https://api.tacweb.com.br/consumo/equipamento?equipamento_id=456"
```

### 3. Configuração de Equipamentos Ativos
```bash
curl -H "Authorization: Bearer TOKEN" \
"https://api.tacweb.com.br/configuracao/equipamento?ativo=true"
```

### 4. Consumo Consolidado por Obra
```bash
curl -H "Authorization: Bearer TOKEN" \
"https://api.tacweb.com.br/consumo/consolidado?agrupar_por=obra&data_inicio=2024-01-01&data_fim=2024-12-31"
```

---

## 📋 Checklist de Configuração

### Backend (Servidor)
- [ ] Configurar `.env` com credenciais do banco de dados
- [ ] Definir `ENCRYPTION_KEY` (32 caracteres)
- [ ] Configurar Redis (host, porta)
- [ ] Executar migrations: `npm run migration:run`
- [ ] Iniciar backend: `npm run dev`

### Configurar Tenant
- [ ] **Criar Tenant**: `POST /api/tenants`
  ```json
  {
    "name": "Empresa ABC",
    "slug": "empresa-abc",
    "is_active": true
  }
  ```

- [ ] **Adicionar Credenciais Tacweb**: `POST /api/credentials`
  ```json
  {
    "tenant_id": 1,
    "provider": "tacweb",
    "base_url": "https://api.tacweb.com.br",
    "auth_type": "bearer",
    "token": "seu-token-jwt-tacweb"
  }
  ```

- [ ] **Ativar Endpoints**: `POST /api/endpoints`
  ```json
  {
    "tenant_id": 1,
    "endpoint_name": "fuel_usage_equipment",
    "is_enabled": true,
    "fetch_frequency_minutes": 60
  }
  ```

- [ ] **Trigger Manual**: `POST /api/scheduler/trigger`
  ```json
  {
    "tenant_id": 1,
    "endpoint_name": "fuel_usage_equipment"
  }
  ```

---

## 🗂️ Estrutura de Respostas

### Sucesso (200 OK)
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_records": 250,
    "per_page": 25
  }
}
```

### Erro (400/401/404)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem do erro",
    "details": {}
  }
}
```

---

## 🔒 Rate Limits

| Limite | Valor |
|--------|-------|
| Requisições/hora | 1.000 |
| Requisições/minuto | 100 |
| Requisições simultâneas | 10 |

---

## 📁 Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `TACWEB_API_ENDPOINTS.md` | Documentação completa dos 14 endpoints |
| `API_EXAMPLES.md` | Exemplos práticos de uso da API interna |
| `DEPLOY_RENDER.md` | Guia de deploy no Render.com |
| `DEVELOPMENT.md` | Guia de desenvolvimento local |
| `MIGRATIONS.md` | Guia de migrations do banco de dados |
| `README.md` | Visão geral do projeto |

---

## 🆘 Comandos Úteis

### Backend
```bash
# Instalar dependências
cd backend && npm install

# Executar migrations
npm run migration:run

# Iniciar desenvolvimento
npm run dev

# Limpar e reiniciar
pm2 delete all
fuser -k 3000/tcp
npm run dev
```

### Docker
```bash
# Subir PostgreSQL + Redis
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Git
```bash
# Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Verificar status
git status
git log --oneline
```

---

## 🎯 Próximos Passos

1. **Obter Credenciais Tacweb**
   - Acesse o portal Tacweb
   - Gere token de API
   - Configure no sistema via `POST /api/credentials`

2. **Testar Conectores Implementados**
   - fuel_usage_utilization
   - fuel_usage_equipment

3. **Implementar Conectores Restantes**
   - 11 endpoints estruturados aguardando implementação

4. **Configurar Produção**
   - Deploy no Render.com
   - Configurar variáveis de ambiente
   - Executar migrations
   - Ativar agendamento horário

---

**Última atualização**: 06/01/2025  
**Projeto**: Sistema de Integração Multi-Tenant Tacweb  
**GitHub**: https://github.com/Luciopvh/Saas_I9Tech_Mine
