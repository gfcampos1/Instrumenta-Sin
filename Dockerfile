# Instrumenta-Sin Railway Build

FROM node:20-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build do Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl bash

# Copiar arquivos necessários
COPY --from=base --chown=nextjs:nodejs /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=base --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=base --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=base --chown=nextjs:nodejs /app/scripts ./scripts

# Tornar script executável
RUN chmod +x ./scripts/init-db.sh

EXPOSE 3000

# Não rodar como nextjs user para ter permissões de escrita no Prisma
# USER nextjs

# Start com script de inicialização
CMD ["/bin/sh", "./scripts/init-db.sh"]
