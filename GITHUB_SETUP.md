# 🔐 Configurar GitHub Privado - Guia Completo

Este guia explica como configurar o projeto no GitHub como repositório privado.

---

## 📋 **Pré-requisitos**

- [x] Conta GitHub (gratuita)
- [ ] GitHub autorizado no Genspark
- [ ] Decidir nome do repositório

---

## 🚀 **Passo a Passo Completo**

### **1️⃣ Autorizar GitHub no Genspark**

**IMPORTANTE**: Você precisa fazer isso ANTES de qualquer comando git push.

#### **Opção A: Via Interface Genspark**

1. **Acesse a aba #github** no Genspark
   - Procure por um botão ou link "GitHub" na interface
   - Pode estar no menu lateral ou topo da página

2. **Clique em "Connect GitHub" ou "Authorize"**

3. **Complete o OAuth Flow**:
   - Você será redirecionado para GitHub
   - Faça login (se necessário)
   - Clique em **"Authorize Genspark"**
   - Autorize acesso aos seus repositórios

4. **Volte para o Genspark**
   - A conexão deve aparecer como ✅ conectada

#### **Opção B: Via Comando (se disponível)**

```bash
# Tente executar na conversa:
# "Configure meu GitHub para este projeto"
```

---

### **2️⃣ Escolher Nome do Repositório**

Você tem duas opções:

**Opção A**: Usar repositório existente `Saas_I9Tech_Mine`
- ✅ Já existe
- ✅ Nome consistente com outros projetos
- ⚠️ Vai sobrescrever conteúdo existente (se houver)

**Opção B**: Criar novo repositório `tacweb-integration`
- ✅ Específico para este projeto
- ✅ Não afeta outros projetos
- 📝 Precisa criar novo repo no GitHub

---

### **3️⃣ Criar Repositório no GitHub (se não existir)**

Se você escolheu criar NOVO repositório:

1. **Acesse**: https://github.com/new

2. **Configure**:
   ```
   Repository name: tacweb-integration
   Description: Sistema multi-tenant de integração com API Tacweb
   Visibility: ⚫ Private (PRIVADO)
   
   ❌ NÃO marque:
   - Add a README file
   - Add .gitignore
   - Choose a license
   ```

3. **Clique em "Create repository"**

4. **IMPORTANTE**: **NÃO siga** as instruções que aparecem. Vamos usar nossos próprios comandos.

---

### **4️⃣ Configurar e Fazer Push**

#### **Método 1: Script Automático (Recomendado)**

```bash
cd /home/user/webapp
./setup-github.sh
```

O script vai perguntar:
```
Digite seu usuário GitHub: [seu-usuario]
Digite o nome do repositório: [Saas_I9Tech_Mine ou tacweb-integration]
Repositório já existe? (s/n): [s ou n]
```

Depois siga as instruções exibidas.

#### **Método 2: Manual**

**Para repositório EXISTENTE** (ex: `Saas_I9Tech_Mine`):

```bash
cd /home/user/webapp

# Configurar Git
git config user.name "seu-usuario"
git config user.email "seu-email@example.com"

# Configurar remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/seu-usuario/Saas_I9Tech_Mine.git

# Renomear branch para main (se necessário)
git branch -M main

# Push com force (sobrescreve)
git push -f origin main
```

**Para repositório NOVO** (ex: `tacweb-integration`):

```bash
cd /home/user/webapp

# Configurar Git
git config user.name "seu-usuario"
git config user.email "seu-email@example.com"

# Configurar remote
git remote add origin https://github.com/seu-usuario/tacweb-integration.git

# Renomear branch para main
git branch -M main

# Push inicial
git push -u origin main
```

---

### **5️⃣ Verificar Push**

Após o push bem-sucedido:

1. **Acesse seu repositório**:
   ```
   https://github.com/seu-usuario/nome-do-repo
   ```

2. **Verifique**:
   - ✅ Repositório está **Private** (ícone de cadeado)
   - ✅ 40 arquivos presentes
   - ✅ README.md exibindo informações do projeto
   - ✅ 3 commits (ou mais se você fez novos commits)

3. **Estrutura deve aparecer assim**:
   ```
   📁 backend/
   📁 frontend/
   📄 README.md
   📄 DEPLOY_RENDER.md
   📄 DEVELOPMENT.md
   📄 API_EXAMPLES.md
   📄 SUMMARY.md
   📄 GITHUB_SETUP.md
   📄 docker-compose.yml
   📄 .gitignore
   ```

---

## 🔧 **Troubleshooting**

### **Erro: "GitHub not authorized"**

**Causa**: GitHub não foi autorizado no Genspark.

**Solução**:
1. Acesse aba #github no Genspark
2. Complete autorização OAuth
3. Tente novamente o push

### **Erro: "remote: Repository not found"**

**Causa**: Repositório não existe ou nome incorreto.

**Solução**:
```bash
# Verificar remote configurado
git remote -v

# Corrigir URL
git remote set-url origin https://github.com/USUARIO-CORRETO/REPO-CORRETO.git

# Ou remover e adicionar novamente
git remote remove origin
git remote add origin https://github.com/USUARIO-CORRETO/REPO-CORRETO.git
```

### **Erro: "failed to push some refs"**

**Causa**: Repositório remoto tem commits que você não tem localmente.

**Solução 1** (Force push - sobrescreve remoto):
```bash
git push -f origin main
```

**Solução 2** (Pull primeiro):
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### **Erro: "Authentication failed"**

**Causa**: Credenciais GitHub não configuradas.

**Solução**:
1. Volte para aba #github no Genspark
2. Reautorize GitHub
3. Tente push novamente

---

## 🔐 **Configurar .gitignore (Já Configurado)**

O projeto já tem `.gitignore` configurado que previne commit de:

```
✅ node_modules/
✅ .env (variáveis sensíveis)
✅ logs/
✅ dist/
✅ *.log
✅ .DS_Store
```

**⚠️ NUNCA comite**:
- Arquivos `.env` com credenciais
- `node_modules/`
- Tokens ou senhas
- Arquivos de log

---

## 📦 **Estrutura de Branches (Opcional)**

Para projetos maiores, considere usar branches:

### **Criar branch de desenvolvimento**:

```bash
# Criar e mudar para branch develop
git checkout -b develop

# Fazer alterações...
git add .
git commit -m "feat: nova funcionalidade"

# Push da branch
git push -u origin develop
```

### **Fluxo GitFlow**:

```
main (produção)
  └── develop (desenvolvimento)
       ├── feature/novo-conector
       ├── feature/frontend-dashboard
       └── bugfix/fix-authentication
```

---

## 🔄 **Workflow Diário**

### **Fazer alterações e commit**:

```bash
cd /home/user/webapp

# Ver status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: implementar conector fuel_usage_period"

# Push
git push origin main
```

### **Mensagens de commit (Conventional Commits)**:

```bash
# Novas funcionalidades
git commit -m "feat: adicionar endpoint de relatórios"

# Correções
git commit -m "fix: corrigir rate limiting por tenant"

# Documentação
git commit -m "docs: atualizar guia de deploy"

# Refatoração
git commit -m "refactor: melhorar estrutura de conectores"

# Testes
git commit -m "test: adicionar testes unitários"

# Build
git commit -m "build: atualizar dependências"
```

---

## 👥 **Colaboradores (Opcional)**

Para adicionar outros desenvolvedores ao projeto privado:

1. **Acesse**: https://github.com/seu-usuario/nome-do-repo/settings/access

2. **Clique em "Add people"**

3. **Digite o username do GitHub** do colaborador

4. **Escolha permissão**:
   - `Read`: Apenas visualizar
   - `Write`: Fazer push
   - `Admin`: Controle total

5. **Clique em "Add [username] to this repository"**

---

## 🔒 **Configurações de Segurança**

### **1. Branch Protection Rules**

Proteger branch `main` de force pushes acidentais:

1. Acesse: `Settings` → `Branches` → `Add rule`
2. Branch name pattern: `main`
3. Marque:
   - ☑️ Require pull request reviews before merging
   - ☑️ Require status checks to pass before merging
4. Save changes

### **2. Secrets (para CI/CD futuro)**

Armazenar credenciais seguras:

1. Acesse: `Settings` → `Secrets and variables` → `Actions`
2. Clique em `New repository secret`
3. Adicione:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `ENCRYPTION_KEY`
   - `JWT_SECRET`

---

## 📊 **GitHub Actions (CI/CD Futuro)**

Exemplo de workflow para testes automáticos:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
    
    - name: Run tests
      working-directory: ./backend
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_HOST: localhost
```

---

## 📞 **Suporte**

### **Problemas com GitHub?**

1. **Documentação GitHub**: https://docs.github.com/
2. **GitHub Support**: https://support.github.com/
3. **Genspark Support**: Acesse aba de suporte no Genspark

### **Problemas com o Projeto?**

Consulte:
- `README.md` - Visão geral
- `DEVELOPMENT.md` - Setup local
- `API_EXAMPLES.md` - Uso da API

---

## ✅ **Checklist Final**

Antes de considerar setup completo:

- [ ] GitHub autorizado no Genspark
- [ ] Repositório criado no GitHub (privado)
- [ ] Git configurado com seu usuário
- [ ] Remote origin configurado
- [ ] Push bem-sucedido
- [ ] Repositório aparece como Private no GitHub
- [ ] README.md visível no repositório
- [ ] 40 arquivos presentes
- [ ] .gitignore funcionando (node_modules não commitado)

---

**Última atualização**: 2025-01-06  
**Status**: Guia completo para GitHub privado

---

## 🎯 **Resumo Rápido**

```bash
# 1. Autorizar GitHub no Genspark (via interface)

# 2. Executar script
cd /home/user/webapp
./setup-github.sh

# 3. Seguir instruções do script

# 4. Verificar no navegador:
# https://github.com/seu-usuario/seu-repo
```

Pronto! Seu projeto está seguro e privado no GitHub! 🎉
