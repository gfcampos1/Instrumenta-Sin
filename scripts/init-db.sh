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

# Corrigir permissões do diretório migrations
echo ""
echo "🔧 Corrigindo permissões..."
chmod -R 755 ./prisma/migrations/
find ./prisma/migrations/ -type f -name "*.sql" -exec chmod 644 {} \;

# Verificar se migration.sql está acessível
echo ""
echo "🔍 Verificando migration.sql..."
if [ -f "./prisma/migrations/20241031_init/migration.sql" ]; then
  echo "✅ migration.sql encontrado ($(wc -c < ./prisma/migrations/20241031_init/migration.sql) bytes)"
  head -n 3 ./prisma/migrations/20241031_init/migration.sql
else
  echo "❌ migration.sql NÃO encontrado!"
fi

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

echo ""
echo "✅ Banco de dados configurado!"

# Iniciar aplicação
echo ""
echo "🚀 Iniciando Next.js na porta ${PORT:-3000}..."
echo "========================================="
exec node server.js
