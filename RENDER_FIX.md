# 🔧 Corrigir Deploy no Render - Guia Rápido

## ❌ Problema Identificado

O Render está tentando fazer deploy como **Docker**, mas o projeto é **Node.js nativo**.

**Erro**: `failed to read dockerfile: open Dockerfile: no such file or directory`

---

## ✅ Solução: Reconfigurar Serviço

### **Opção 1: Deletar e Recriar (Recomendado)**

#### **1. Deletar serviço atual**

1. Acesse: https://dashboard.render.com/web/srv-d5eirichg0os739cnrig
2. Vá em **Settings** (menu lateral)
3. Role até o final da página
4. Clique em **Delete Web Service**
5. Digite o nome do serviço para confirmar
6. Clique em **Delete**

#### **2. Criar novo serviço CORRETAMENTE**

1. **Acesse**: https://dashboard.render.com/create?type=web

2. **Conecte o repositório**: `Luciopvh/Saas_I9Tech_Mine`

3. **Configure assim**:
   ```
   Name: tacweb-backend
   Region: Oregon (US West) ou Frankfurt (Europe)
   Branch: main
   
   ⚠️ IMPORTANTE: Root Directory
   Root Directory: backend
   
   ⚠️ IMPORTANTE: Runtime
   Runtime: Node
   
   Build Command: npm install && npm run build
   Start Command: npm start
   
   Instance Type: Free
   ```

4. **Environment Variables** (clique em "Advanced"):
   ```
   NODE_ENV=production
   PORT=3000
   DB_TYPE=postgres
   LOG_LEVEL=info
   ```

5. **Clique em "Create Web Service"**

---

### **Opção 2: Modificar Serviço Existente**

Se preferir NÃO deletar, tente modificar:

#### **Passo 1: Mudar para Node.js**

1. Acesse: https://dashboard.render.com/web/srv-d5eirichg0os739cnrig/settings
2. Procure por **"Runtime"** ou **"Build"**
3. **PROBLEMA**: Render não permite mudar de Docker para Node após criar

**Conclusão**: **Opção 1 (deletar e recriar) é necessária** ❌

---

## 📝 **Configuração Correta Passo-a-Passo**

### **Backend (Web Service)**

```yaml
Name: tacweb-backend
Runtime: Node (NÃO Docker!)
Region: Oregon
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free ou Starter
```

**Environment Variables**:
```bash
NODE_ENV=production
PORT=3000
DB_TYPE=postgres
DB_HOST=<seu_postgres_host>
DB_PORT=5432
DB_USERNAME=<seu_postgres_user>
DB_PASSWORD=<seu_postgres_password>
DB_DATABASE=tacweb_integration
REDIS_HOST=<seu_redis_host>
REDIS_PORT=6379
JWT_SECRET=<gerar_string_aleatoria>
ENCRYPTION_KEY=<gerar_string_aleatoria>
LOG_LEVEL=info
```

---

### **Frontend (Static Site)**

```yaml
Name: tacweb-frontend
Type: Static Site
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

**Environment Variables**:
```bash
VITE_API_URL=https://tacweb-backend.onrender.com
```

⚠️ **Substitua** `tacweb-backend` pela URL real do seu backend após criar.

---

## 🔄 **Ordem de Criação Recomendada**

1. ✅ **PostgreSQL Database** (se ainda não criou)
2. ✅ **Redis Instance** (se ainda não criou)
3. 🔄 **Backend Web Service** (DELETAR e RECRIAR corretamente)
4. ⏳ **Worker Background Worker** (criar depois)
5. ⏳ **Scheduler Background Worker** (criar depois)
6. ⏳ **Frontend Static Site** (criar por último)

---

## 📋 **Checklist de Configuração**

### Antes de criar o serviço:

- [ ] Repositório GitHub está privado ou público?
- [ ] PostgreSQL criado e URL copiada?
- [ ] Redis criado e URL copiada?
- [ ] Chaves de segurança geradas (JWT_SECRET, ENCRYPTION_KEY)?

### Ao criar o Backend:

- [ ] **Runtime**: Node ✅ (NÃO Docker ❌)
- [ ] **Root Directory**: `backend` ✅
- [ ] **Build Command**: `npm install && npm run build` ✅
- [ ] **Start Command**: `npm start` ✅
- [ ] **Environment Variables**: Todas adicionadas ✅

### Após criar:

- [ ] Deploy bem-sucedido? (status "Live" em verde)
- [ ] Health check funciona? `curl https://seu-backend.onrender.com/health`
- [ ] Logs mostram "Server running on port 3000"?

---

## 🐛 **Troubleshooting**

### Erro: "Cannot find module"

**Causa**: `npm install` não rodou ou falhou.

**Solução**:
1. Verifique logs do build
2. Confirme que `Root Directory: backend` está correto
3. Tente **Manual Deploy** → **Clear build cache & deploy**

### Erro: "Port 3000 is already in use"

**Causa**: Variável `PORT` não configurada ou conflito.

**Solução**:
1. Adicione `PORT=3000` nas Environment Variables
2. OU remova `PORT` (Render define automaticamente)

### Erro: "Application failed to respond"

**Causa**: Servidor não iniciou corretamente.

**Solução**:
1. Verifique **Logs** do serviço
2. Procure por erros de banco de dados
3. Confirme que `DB_*` e `REDIS_*` variáveis estão corretas

### Deploy lento ou timeout

**Causa**: Free tier demora para build.

**Solução**:
- Free: 10-15 minutos é normal
- Starter: 3-5 minutos
- Aguarde pacientemente ou upgrade para Starter

---

## 📞 **Precisa de Ajuda?**

### **Passo-a-Passo Visual**

1. **Deletar serviço atual**:
   - Dashboard → Seu serviço → Settings → Delete Web Service

2. **Criar novo**:
   - Dashboard → New → Web Service
   - Connect GitHub → Luciopvh/Saas_I9Tech_Mine
   - **Runtime: Node** ⚠️ (não Docker!)
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Add Environment Variables
   - Create Web Service

3. **Aguardar deploy**:
   - Status: Building → Live (10-15 min)
   - Testar: `curl https://seu-backend.onrender.com/health`

---

## 💡 **Dicas Importantes**

### ✅ **CORRETO**:
```
Runtime: Node
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### ❌ **ERRADO**:
```
Runtime: Docker (causa o erro que você teve)
Root Directory: (vazio)
Build Command: (vazio)
```

---

## 🎯 **Resumo da Solução**

**Problema**: Render configurado como Docker  
**Solução**: Deletar serviço e recriar como Node.js  
**Tempo**: 15-20 minutos  
**Custo**: $0 (Free tier)  

---

## 📚 **Documentação de Referência**

- **Render Node.js**: https://render.com/docs/deploy-node-express-app
- **Render Environment Variables**: https://render.com/docs/environment-variables
- **Render Build & Deploy**: https://render.com/docs/builds

---

## ✅ **Próximo Passo**

**AGORA**:
1. Deletar serviço `Saas_I9Tech_Mine` atual
2. Criar novo serviço seguindo configurações acima
3. Aguardar deploy
4. Testar health check
5. Me avisar quando estiver "Live"!

**Precisa de ajuda com algum passo específico?** 🚀
