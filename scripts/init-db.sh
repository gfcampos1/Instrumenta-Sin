#!/bin/sh
set -e

echo "========================================="
echo "🔧 Instrumenta-Sin - Inicializacao"
echo "========================================="

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL não configurada"
  exit 1
fi

echo "✅ DATABASE_URL: ${DATABASE_URL%%@*}@***"

# Debug: listar conteúdo da pasta migrations
echo ""
echo "🔍 Debug: Listando migrations..."
ls -la ./prisma/migrations/ || echo "Pasta migrations não encontrada"
if [ -d "./prisma/migrations/20241031_init" ]; then
  echo "📁 Conteúdo de 20241031_init:"
  ls -la ./prisma/migrations/20241031_init/
else
  echo "❌ Diretório 20241031_init não existe"
fi

# Gerar Prisma Client
echo ""
echo "📦 Gerando Prisma Client..."
./node_modules/.bin/prisma generate || {
  echo "❌ Erro ao gerar Prisma Client"
  exit 1
}

# Aplicar migrations
echo ""
echo "🔄 Aplicando migrations..."
./node_modules/.bin/prisma migrate deploy || {
  echo "❌ Erro ao aplicar migrations"
  exit 1
}

echo ""
echo "✅ Banco de dados configurado!"

# Iniciar aplicação
echo ""
echo "🚀 Iniciando Next.js na porta ${PORT:-3000}..."
echo "========================================="
exec node server.js
