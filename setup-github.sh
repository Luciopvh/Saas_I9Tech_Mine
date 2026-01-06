#!/bin/bash

# Script para configurar GitHub após autorização no Genspark
# Execute este script após autorizar GitHub na aba #github

set -e

echo "🚀 Configurando GitHub para projeto Tacweb Integration..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto (webapp/)"
    exit 1
fi

echo -e "${BLUE}📋 Informações necessárias:${NC}"
echo ""
echo "1. Nome do usuário GitHub"
echo "2. Nome do repositório (ex: Saas_I9Tech_Mine ou tacweb-integration)"
echo ""

# Input do usuário
read -p "Digite seu usuário GitHub: " GITHUB_USER
read -p "Digite o nome do repositório: " REPO_NAME
read -p "Repositório já existe? (s/n): " REPO_EXISTS

echo ""
echo -e "${YELLOW}⚙️  Configurando Git...${NC}"

# Configurar Git (se ainda não estiver)
git config user.name "$GITHUB_USER" 2>/dev/null || true
git config user.email "$GITHUB_USER@users.noreply.github.com" 2>/dev/null || true

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "📌 Renomeando branch para 'main'..."
    git branch -M main
fi

# Configurar remote
echo "🔗 Configurando remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo "📤 Para fazer push, execute:"
echo ""
if [ "$REPO_EXISTS" = "s" ] || [ "$REPO_EXISTS" = "S" ]; then
    echo -e "${BLUE}   git push -f origin main${NC}  # Force push (sobrescreve repositório existente)"
else
    echo -e "${BLUE}   # Primeiro, crie o repositório em GitHub:${NC}"
    echo -e "${BLUE}   # https://github.com/new${NC}"
    echo -e "${BLUE}   # Nome: $REPO_NAME${NC}"
    echo -e "${BLUE}   # Visibilidade: Private (Privado)${NC}"
    echo ""
    echo -e "${BLUE}   # Depois execute:${NC}"
    echo -e "${BLUE}   git push -u origin main${NC}"
fi

echo ""
echo "🔍 URL do repositório: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
