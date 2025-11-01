# Guia de Deploy Railway - Instrumenta-Sin

## 🚂 Por que Railway?

Railway é uma plataforma moderna de deployment que oferece:

✅ **Simplicidade**: Deploy com um clique, zero configuração de DevOps  
✅ **All-in-One**: Database, Redis, Storage e App no mesmo lugar  
✅ **Auto-scaling**: Escala automaticamente conforme demanda  
✅ **Preview Environments**: Cada PR gera um ambiente de teste  
✅ **Custo-benefício**: Plano gratuito generoso + preços justos  
✅ **DX Excelente**: CLI poderosa, logs em tempo real, métricas builtin

---

## 📋 Pré-requisitos

- Conta no [Railway.app](https://railway.app)
- Repositório GitHub do projeto
- Node.js 20+ instalado localmente

---

## 🚀 Setup Inicial

### 1. Instalar Railway CLI

```powershell
# Windows (via npm)
npm install -g @railway/cli

# Ou via Scoop
scoop install railway
```

### 2. Login no Railway

```powershell
railway login
```

### 3. Criar Novo Projeto

Via CLI:
```powershell
railway init
```

Ou via Dashboard:
1. Acesse [railway.app/new](https://railway.app/new)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `Instrumenta-Sin`

---

## 🗄️ Configurar Banco de Dados

### PostgreSQL + PostGIS

```powershell
# Adicionar PostgreSQL ao projeto
railway add postgresql

# Obter connection string
railway variables
```

#### Habilitar PostGIS

1. No Dashboard Railway, abra o PostgreSQL
2. Vá em "Connect" → "Connect via psql"
3. Execute:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Redis (Cache)

```powershell
# Adicionar Redis ao projeto
railway add redis
```

---

## ⚙️ Variáveis de Ambiente

### Via Railway Dashboard

1. Vá em "Variables"
2. Adicione as seguintes variáveis:

```env
# Database (Auto-preenchido pelo Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# NextAuth
NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Cloudinary (Upload de Imagens)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# SendGrid (E-mails)
SENDGRID_API_KEY=sua-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@instrumenta-sin.com

# Sentry (Monitoramento)
NEXT_PUBLIC_SENTRY_DSN=seu-sentry-dsn
SENTRY_AUTH_TOKEN=seu-sentry-auth-token

# App Config
NODE_ENV=production
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### Via CLI

```powershell
# Definir variável individual
railway variables set NEXTAUTH_SECRET="seu-secret-aqui"

# Importar de arquivo .env
railway variables set --from-file .env.production
```

---

## 📦 Configurar Build

### railway.json (Opcional)

Crie `railway.json` na raiz do projeto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### nixpacks.toml (Alternativo)

```toml
[phases.setup]
nixPkgs = ["nodejs-20_x", "postgresql"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"
```

---

## 🔄 Deploy Automático (GitHub Integration)

### Configurar Auto-Deploy

1. No Railway Dashboard, vá em "Settings"
2. Em "Source", conecte seu repositório GitHub
3. Configure:
   - **Branch**: `main` (produção)
   - **Root Directory**: `/` (ou caminho do projeto)
   - **Auto Deploy**: ✅ Habilitado

### Preview Environments

Railway cria automaticamente ambientes de preview para cada PR:

```yaml
# .github/workflows/railway-preview.yml
name: Railway Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: instrumenta-sin
```

---

## 🗃️ Migrations e Seeders

### Executar Migrations no Deploy

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### Executar Manualmente

```powershell
# Via CLI local conectado ao Railway
railway run npm run prisma:migrate

# Ou via Railway Shell
railway shell
> npx prisma migrate deploy
```

### Seed Inicial

```powershell
# Criar seed script
railway run npm run prisma:seed
```

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed de badges
  await prisma.badge.createMany({
    data: [
      {
        name: 'Primeira Cirurgia',
        description: 'Registrou sua primeira cirurgia',
        iconUrl: '/badges/first.svg',
        pointsRequired: 0,
        category: 'INICIANTE',
        rarity: 'COMUM',
      },
      // ... mais badges
    ],
  });

  console.log('✅ Seed completo!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 📊 Monitoramento e Logs

### Visualizar Logs em Tempo Real

```powershell
# Via CLI
railway logs

# Logs com filtro
railway logs --filter error
```

### Dashboard de Métricas

Railway fornece automaticamente:
- 📈 CPU Usage
- 💾 Memory Usage
- 🌐 Network Traffic
- 🔄 Request Count
- ⏱️ Response Time

Acesse em: `Dashboard → Service → Metrics`

### Configurar Alertas

1. Vá em "Settings" → "Alerts"
2. Configure alertas para:
   - CPU > 80%
   - Memory > 90%
   - Crash/Restart
   - Deploy Failed

---

## 🌐 Domínio Customizado

### Configurar Domínio

1. No Railway Dashboard, vá em "Settings" → "Domains"
2. Clique em "Custom Domain"
3. Digite seu domínio: `app.instrumenta-sin.com`

### Configurar DNS

Adicione no seu provedor de DNS:

```
Type: CNAME
Name: app (ou @)
Value: <seu-projeto>.up.railway.app
```

Railway provisiona SSL automaticamente via Let's Encrypt.

---

## 🔐 Secrets e Segurança

### Variáveis Sensíveis

```powershell
# Adicionar secrets via CLI (não aparecem em logs)
railway variables set --secret DATABASE_PASSWORD="senha-segura"
```

### Rotação de Secrets

```powershell
# Gerar novo NEXTAUTH_SECRET
openssl rand -base64 32

# Atualizar no Railway
railway variables set NEXTAUTH_SECRET="novo-secret"

# Reiniciar serviço
railway up
```

---

## 💾 Backups Automáticos

### PostgreSQL Backups

Railway faz backup automático do PostgreSQL:
- **Frequência**: Diária
- **Retenção**: 7 dias (Hobby), 30 dias (Pro)

### Restaurar Backup

```powershell
# Listar backups
railway pg:backups

# Restaurar backup específico
railway pg:restore <backup-id>
```

### Backup Manual

```powershell
# Criar dump do banco
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload para storage externo (opcional)
```

---

## 📈 Scaling e Performance

### Vertical Scaling (Railway Pro)

1. Vá em "Settings" → "Resources"
2. Ajuste:
   - vCPU: 1-8 cores
   - RAM: 512MB - 32GB

### Horizontal Scaling

Railway escala automaticamente instâncias quando necessário.

### Otimizações Next.js

```javascript
// next.config.js
module.exports = {
  output: 'standalone', // Build otimizado
  compress: true,
  poweredByHeader: false,
  
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    optimizeCss: true,
  },
};
```

---

## 🚨 Rollback e Recuperação

### Rollback para Deploy Anterior

```powershell
# Via CLI
railway rollback

# Via Dashboard
1. Vá em "Deployments"
2. Clique nos 3 pontos do deploy anterior
3. "Redeploy"
```

### Health Checks

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', timestamp: new Date() });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
```

---

## 💰 Custos e Otimização

### Planos Railway

**Hobby** (Grátis):
- $5/mês em créditos
- Ideal para desenvolvimento

**Pro** ($20/mês + uso):
- Recursos ilimitados
- Backups de 30 dias
- Suporte prioritário

### Otimizar Custos

```powershell
# Verificar uso atual
railway usage

# Pausar ambientes não-utilizados
railway environment delete staging-old
```

### Estimativa Instrumenta-Sin

```
Web Service:        $8-12/mês
PostgreSQL:         $5-8/mês
Redis:              $3-5/mês
Bandwidth (100GB):  Incluído
──────────────────────────────
TOTAL:              $16-25/mês
```

---

## 🔧 Troubleshooting

### Build Falhou

```powershell
# Ver logs detalhados
railway logs --deployment <deployment-id>

# Rebuild
railway up --detach
```

### Database Connection Issues

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Out of Memory

Aumente memória em Settings → Resources ou otimize:

```javascript
// next.config.js
module.exports = {
  experimental: {
    memoryBasedWorkersCount: true,
  },
};
```

---

## 📚 Recursos Úteis

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)
- [Railway Templates](https://railway.app/templates)

---

## ✅ Checklist de Deploy

- [ ] Projeto criado no Railway
- [ ] PostgreSQL + PostGIS configurado
- [ ] Redis adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] GitHub integration ativada
- [ ] Migrations executadas
- [ ] Seed inicial rodado
- [ ] Health check implementado
- [ ] Domínio customizado configurado
- [ ] SSL ativo
- [ ] Alertas configurados
- [ ] Backups verificados
- [ ] Monitoramento ativo (Sentry)
- [ ] Logs funcionando

---

**Pronto! Seu Instrumenta-Sin está no ar com Railway! 🚂✨**
