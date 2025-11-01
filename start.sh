#!/bin/sh
# Railway startup script

echo "🚀 Starting Instrumenta-Sin..."

# Run migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Check if we need to seed
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

# Start the application
echo "✅ Starting Next.js server..."
npm run start
