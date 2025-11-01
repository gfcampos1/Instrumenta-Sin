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

# Gerar Prisma Client
echo ""
echo "📦 Gerando Prisma Client..."
./node_modules/.bin/prisma generate || {
  echo "❌ Erro ao gerar Prisma Client"
  exit 1
}

# Aplicar schema ao banco (usando db push ao invés de migrate deploy)
echo ""
echo "🔄 Aplicando schema ao banco..."
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss || {
  echo "❌ Erro ao aplicar schema"
  exit 1
}

# Executar seed (popular banco de dados)
echo ""
echo "🌱 Populando banco de dados..."
node ./prisma/seed.js || {
  echo "⚠️  Aviso: Erro ao executar seed (pode já estar populado)"
}

echo ""
echo "✅ Banco de dados configurado!"

# Iniciar aplicação
echo ""
echo "🚀 Iniciando Next.js na porta ${PORT:-3000}..."
echo "========================================="
exec node server.js
