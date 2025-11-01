# 🚀 Guia de Início Rápido - Instrumenta-Sin

## ✅ Status Atual

O projeto foi inicializado com:
- ✅ Next.js 14 configurado
- ✅ TypeScript
- ✅ Tailwind CSS com paleta Sintegra
- ✅ Prisma ORM com schema completo
- ✅ Estrutura de pastas criada
- ✅ Dependências instaladas

## 📋 Próximos Passos

### 1. Adicionar Logo da Sintegra

Coloque o arquivo `sintegra-logo.png` em:
```
public/logo/sintegra-logo.png
```

**Especificações recomendadas:**
- Formato: PNG com transparência
- Largura: 400-800px
- Cores da marca: #4DB5E8 e #2B5C9E

### 2. Configurar Banco de Dados

#### Opção A: PostgreSQL Local

```powershell
# 1. Crie um arquivo .env na raiz
cp .env.example .env

# 2. Edite o .env e configure:
DATABASE_URL="postgresql://postgres:senha@localhost:5432/instrumenta_sin"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

#### Opção B: Railway (Recomendado)

```powershell
# 1. Instale Railway CLI
npm install -g @railway/cli

# 2. Faça login
railway login

# 3. Crie novo projeto
railway init

# 4. Adicione PostgreSQL
railway add -d postgres

# 5. Copie a DATABASE_URL
railway variables
```

### 3. Executar Migrations

```powershell
# Criar banco e rodar migrations
npx prisma migrate dev --name init

# Popular com dados iniciais
npx prisma db seed
```

### 4. Iniciar Servidor de Desenvolvimento

```powershell
npm run dev
```

Acesse: **http://localhost:3000**

## 🎨 Credenciais Padrão (Seed)

Após rodar o seed, você terá:

**Admin:**
- Email: `admin@sintegra.com`
- Senha: `admin123`

**Instrumentadores:**
- Email: `joao@sintegra.com` | Senha: `user123`
- Email: `maria@sintegra.com` | Senha: `user123`

## 🛠️ Comandos Úteis

```powershell
# Desenvolvimento
npm run dev                    # Inicia servidor dev

# Prisma
npm run prisma:studio          # Interface visual do banco
npm run prisma:generate        # Gera Prisma Client
npm run prisma:migrate         # Cria nova migration
npx prisma migrate deploy      # Aplica migrations (produção)

# Build e Deploy
npm run build                  # Build para produção
npm run start                  # Inicia servidor produção
npm run lint                   # Executa linter

# Railway
railway up                     # Deploy para Railway
railway logs                   # Ver logs
railway variables set KEY=value # Configurar variável
```

## 📁 Estrutura de Pastas

```
Instrumenta-Sin/
├── public/
│   ├── logo/                  # ⚠️ COLOQUE O LOGO AQUI
│   │   └── sintegra-logo.png
│   ├── icons/                 # Ícones PWA (72x72 até 512x512)
│   ├── badges/                # Badges de gamificação
│   └── manifest.json
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   └── health/       # Health check
│   │   ├── page.tsx          # Homepage
│   │   └── layout.tsx        # Layout principal
│   ├── components/            # Componentes React (criar)
│   │   ├── ui/               # Componentes base
│   │   ├── forms/            # Formulários
│   │   └── layout/           # Layout components
│   └── lib/                   # Utilitários
│       └── prisma.ts         # Cliente Prisma
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   ├── seed.ts               # Seed de dados
│   └── migrations/           # Migrations SQL
├── docs/                      # Documentação completa
└── .env                       # Variáveis de ambiente (criar)
```

## 🎯 Roadmap de Desenvolvimento

### Fase 1: Autenticação (Semana 1-2)
- [ ] NextAuth.js configurado
- [ ] Páginas de login/registro
- [ ] Proteção de rotas
- [ ] Roles (Admin/Instrumentador)

### Fase 2: Backend Core (Semana 3-5)
- [ ] APIs de cirurgias
- [ ] APIs de dispositivos
- [ ] Sistema de gamificação
- [ ] Geolocalização (PostGIS)

### Fase 3: Frontend Mobile (Semana 6-9)
- [ ] Interface mobile-first
- [ ] Scanner de barcode
- [ ] Formulário de cirurgia
- [ ] Dashboard do instrumentador
- [ ] PWA configurado

### Fase 4: Torre de Controle (Semana 10-12)
- [ ] Dashboard admin
- [ ] Mapa com cirurgias
- [ ] Estatísticas em tempo real
- [ ] Gestão de usuários

### Fase 5: Gamificação (Semana 13-14)
- [ ] Sistema de pontos
- [ ] Badges e conquistas
- [ ] Rankings
- [ ] Missões

### Fase 6: Deploy (Semana 15-16)
- [ ] Deploy no Railway
- [ ] Cloudinary configurado
- [ ] Testes E2E
- [ ] Monitoramento (Sentry)

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
```powershell
npx prisma generate
```

### Erro: "Database does not exist"
```powershell
# Crie o banco manualmente ou use:
npx prisma migrate dev
```

### Erro: "PostGIS extension not found"
```sql
-- No PostgreSQL, execute:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Port 3000 já em uso
```powershell
# Use outra porta:
$env:PORT=3001; npm run dev
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Documentação do Projeto](./docs/)

## 🆘 Suporte

Consulte a documentação completa em `/docs`:
- [ARQUITETURA.md](./docs/ARQUITETURA.md) - Arquitetura do sistema
- [MODELO_DADOS.md](./docs/MODELO_DADOS.md) - Schema e queries
- [CRONOGRAMA.md](./docs/CRONOGRAMA.md) - Timeline do projeto
- [RAILWAY_DEPLOY.md](./docs/RAILWAY_DEPLOY.md) - Deploy detalhado

---

**Desenvolvido com 💙 pela Sintegra**
