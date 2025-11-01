#!/bin/sh
set -e

echo "🔧 Iniciando configuração do banco de dados..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL não configurada"
  exit 1
fi

echo "✅ DATABASE_URL configurada"

# Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

# Aplicar migrations
echo "🔄 Aplicando migrations..."
npx prisma migrate deploy

# Verificar se as tabelas foram criadas
echo "🔍 Verificando tabelas..."
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';
EOF

echo "✅ Banco de dados configurado com sucesso!"

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
exec node server.js
