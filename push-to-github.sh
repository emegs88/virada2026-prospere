#!/bin/bash

# Script para fazer push do projeto para o GitHub

echo "🚀 Preparando para fazer push para o GitHub..."
echo ""
echo "📝 Passos:"
echo "1. Acesse: https://github.com/new"
echo "2. Crie um novo repositório (ex: painel-2026)"
echo "3. NÃO inicialize com README, .gitignore ou license"
echo "4. Copie a URL do repositório (ex: https://github.com/seu-usuario/painel-2026.git)"
echo ""
read -p "Cole a URL do repositório GitHub: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL não fornecida. Saindo..."
    exit 1
fi

echo ""
echo "🔗 Adicionando remote..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

echo "📤 Fazendo push..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Sucesso! Projeto enviado para o GitHub!"
    echo "🌐 Acesse: $REPO_URL"
else
    echo ""
    echo "❌ Erro ao fazer push. Verifique:"
    echo "   - Se o repositório foi criado no GitHub"
    echo "   - Se você tem permissão para fazer push"
    echo "   - Se está autenticado no GitHub"
fi
