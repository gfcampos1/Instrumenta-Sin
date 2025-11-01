# Arquitetura do Sistema

## 🏗️ Visão Geral da Arquitetura

### Stack Tecnológico

#### Frontend
- **Framework**: React 18 com TypeScript
- **Meta-Framework**: Next.js 14+ (App Router)
- **Mobile-First**: PWA (Progressive Web App)
- **Estilização**: Tailwind CSS + Framer Motion
- **Design System**: Paleta Sintegra (baseada em OKR Manager)
- **Mapas**: Leaflet.js
- **Gráficos**: Recharts
- **Estado Global**: Zustand
- **Formulários**: React Hook Form + Zod
- **Scanner**: html5-qrcode
- **Geolocalização**: Navigator API
- **Build**: Next.js Build System
- **PWA**: next-pwa

#### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Next.js API Routes + tRPC (opcional)
- **Linguagem**: TypeScript
- **Validação**: Zod
- **ORM**: Prisma
- **Autenticação**: NextAuth.js (JWT + Sessions)
- **Upload de Arquivos**: Railway Storage ou Cloudinary
- **Real-time**: Socket.io ou Pusher
- **Documentação API**: tRPC (type-safe) ou Swagger

#### Banco de Dados
- **Principal**: PostgreSQL 15+
- **Cache/Sessões**: Redis
- **Geoespacial**: PostGIS (extensão PostgreSQL)

#### Infraestrutura
- **Platform**: Railway.app (PaaS)
- **Containerização**: Railway Nixpacks (auto-detect)
- **CI/CD**: Railway GitHub Integration (auto-deploy)
- **Monitoramento**: Sentry (erros) + Railway Metrics
- **Storage**: Railway Volumes ou Cloudinary
- **CDN**: Railway CDN + Cloudflare (opcional)
- **Database Hosting**: Railway PostgreSQL

---

## 📐 Arquitetura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      CAMADA CLIENTE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐    ┌──────────────────────┐       │
│  │   Mobile (PWA)       │    │   Desktop (Web)      │       │
│  │                      │    │                      │       │
│  │ - GPS Tracking       │    │ - Torre de Controle  │       │
│  │ - Barcode Scanner    │    │ - Dashboard Admin    │       │
│  │ - Formulários        │    │ - Relatórios         │       │
│  │ - Gamificação        │    │ - Gestão de Usuários │       │
│  └──────────────────────┘    └──────────────────────┘       │
│              │                           │                   │
└──────────────┼───────────────────────────┼───────────────────┘
               │                           │
               └───────────┬───────────────┘
                           │
                      HTTPS/WSS
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    CAMADA API                                 │
├──────────────────────────┼───────────────────────────────────┤
│                          │                                    │
│              ┌───────────▼─────────────┐                      │
│              │   API Gateway/LB        │                      │
│              │   (NGINX/CloudFlare)    │                      │
│              └───────────┬─────────────┘                      │
│                          │                                    │
│       ┌──────────────────┼──────────────────┐                │
│       │                  │                  │                │
│  ┌────▼─────┐    ┌──────▼──────┐    ┌─────▼─────┐           │
│  │   REST   │    │  WebSocket  │    │   Auth    │           │
│  │   API    │    │   Server    │    │  Service  │           │
│  │          │    │  (Socket.io)│    │   (JWT)   │           │
│  └────┬─────┘    └──────┬──────┘    └─────┬─────┘           │
│       │                 │                  │                 │
└───────┼─────────────────┼──────────────────┼─────────────────┘
        │                 │                  │
        └─────────────────┼──────────────────┘
                          │
┌─────────────────────────┼─────────────────────────────────────┐
│                   CAMADA DE DADOS                              │
├─────────────────────────┼─────────────────────────────────────┤
│                         │                                      │
│   ┌─────────────────────▼──────────────┐                      │
│   │      PostgreSQL + PostGIS          │                      │
│   │  - Usuários                         │                      │
│   │  - Cirurgias                        │                      │
│   │  - Dispositivos                     │                      │
│   │  - Gamificação                      │                      │
│   │  - Geolocalização                   │                      │
│   └────────────────────────────────────┘                      │
│                                                                 │
│   ┌─────────────────────────────────────┐                     │
│   │          Redis Cache                │                     │
│   │  - Sessões ativas                   │                     │
│   │  - Rankings em tempo real           │                     │
│   │  - Rate limiting                    │                     │
│   └─────────────────────────────────────┘                     │
│                                                                 │
│   ┌─────────────────────────────────────┐                     │
│   │          AWS S3 / Azure Blob        │                     │
│   │  - Fotos de evidências              │                     │
│   │  - Documentos anexos                │                     │
│   └─────────────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados Principal

### 1. Registro de Cirurgia (Instrumentador)

```
[Mobile PWA]
    │
    ├──> (1) GPS captura localização automática
    │
    ├──> (2) Scanner lê código de barras do dispositivo
    │
    ├──> (3) Instrumentador preenche formulário:
    │         - Como ocorreu a cirurgia
    │         - Conduta do médico
    │         - Problemas com dispositivo
    │         - Fotos de evidência (opcional)
    │
    └──> (4) Envia dados via API
              │
              ▼
         [Backend API]
              │
              ├──> Valida JWT token
              ├──> Valida dados com Zod
              ├──> Processa imagens → S3
              ├──> Salva no PostgreSQL
              ├──> Atualiza cache Redis
              ├──> Calcula pontos gamificação
              └──> Emite evento WebSocket
                        │
                        ▼
                   [Torre de Controle]
                        │
                        └──> Atualiza mapa em tempo real
                        └──> Mostra notificação de nova cirurgia
```

### 2. Monitoramento em Tempo Real (Admin)

```
[Dashboard Admin]
    │
    ├──> WebSocket conectado ao backend
    │
    ├──> Recebe eventos em tempo real:
    │     - Nova cirurgia registrada
    │     - Localização de instrumentadores
    │     - Alertas de problemas
    │
    └──> Visualiza no mapa:
          - Pins de cirurgias recentes
          - Localização atual de instrumentadores
          - Heatmap de atividades
          - Alertas destacados
```

---

## 🗄️ Modelo de Dados (Simplificado)

### Principais Entidades

```typescript
// Usuários
User {
  id: UUID
  email: String
  password: Hash
  role: Enum ['INSTRUMENTADOR', 'ADMIN', 'SUPERVISOR']
  name: String
  phone: String
  avatar_url: String
  active: Boolean
  created_at: DateTime
  
  // Gamificação
  points: Integer
  level: Integer
  badges: Badge[]
  
  // Relações
  surgeries: Surgery[]
  locations: Location[]
}

// Dispositivos Médicos
Device {
  id: UUID
  barcode: String (UNIQUE)
  name: String
  category: String
  manufacturer: String
  model: String
  lot_number: String
  expiration_date: Date
  active: Boolean
  
  // Relações
  surgeries: Surgery[]
}

// Cirurgias
Surgery {
  id: UUID
  user_id: UUID (FK)
  device_id: UUID (FK)
  
  // Dados da cirurgia
  surgery_date: DateTime
  surgery_type: String
  hospital_name: String
  
  // Localização
  latitude: Float
  longitude: Float
  location_accuracy: Float
  
  // Avaliação
  status: Enum ['SUCESSO', 'PROBLEMA', 'COMPLICACAO']
  doctor_conduct: String (TEXT)
  device_performance: String (TEXT)
  problems_reported: String (TEXT)
  notes: String (TEXT)
  
  // Evidências
  photos: String[] (URLs S3)
  
  // Metadata
  created_at: DateTime
  updated_at: DateTime
}

// Localização em Tempo Real
Location {
  id: UUID
  user_id: UUID (FK)
  latitude: Float
  longitude: Float
  accuracy: Float
  timestamp: DateTime
  
  // PostGIS
  geom: GEOGRAPHY(Point, 4326)
}

// Gamificação - Badges
Badge {
  id: UUID
  name: String
  description: String
  icon_url: String
  points_required: Integer
  category: String
}

// Gamificação - Conquistas
Achievement {
  id: UUID
  user_id: UUID (FK)
  badge_id: UUID (FK)
  earned_at: DateTime
}

// Missões/Desafios
Mission {
  id: UUID
  title: String
  description: String
  points_reward: Integer
  start_date: DateTime
  end_date: DateTime
  active: Boolean
}
```

---

## 🔐 Segurança

### Autenticação e Autorização
- **JWT** com tokens de curta duração (15min)
- **Refresh Tokens** armazenados em httpOnly cookies
- **RBAC** (Role-Based Access Control)
- **Rate Limiting** por IP e usuário
- **2FA** opcional para administradores

### Proteção de Dados
- **HTTPS** obrigatório
- **Encriptação** de dados sensíveis em repouso
- **Sanitização** de inputs
- **CORS** configurado adequadamente
- **CSP** (Content Security Policy)
- **LGPD/HIPAA** compliance para dados médicos

### Privacidade de Localização
- Dados de GPS armazenados com consentimento
- Opção de anonimização após período
- Acesso restrito a administradores autorizados

---

## 📡 APIs e Integrações

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

#### Cirurgias
- `POST /api/surgeries` - Registrar cirurgia
- `GET /api/surgeries` - Listar cirurgias (com filtros)
- `GET /api/surgeries/:id` - Detalhes de cirurgia
- `PATCH /api/surgeries/:id` - Atualizar cirurgia

#### Dispositivos
- `GET /api/devices` - Listar dispositivos
- `GET /api/devices/barcode/:code` - Buscar por código de barras
- `POST /api/devices` - Cadastrar dispositivo (admin)

#### Usuários
- `GET /api/users/me` - Perfil do usuário
- `PATCH /api/users/me` - Atualizar perfil
- `GET /api/users` - Listar usuários (admin)

#### Gamificação
- `GET /api/gamification/leaderboard` - Ranking
- `GET /api/gamification/badges` - Badges disponíveis
- `GET /api/gamification/missions` - Missões ativas

#### Localização
- `POST /api/locations` - Enviar localização
- `GET /api/locations/active` - Instrumentadores ativos (admin)

#### Torre de Controle
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/map-data` - Dados para o mapa
- `GET /api/dashboard/alerts` - Alertas ativos

### WebSocket Events

#### Client → Server
- `location:update` - Atualização de localização
- `user:online` - Usuário online

#### Server → Client
- `surgery:created` - Nova cirurgia registrada
- `location:updated` - Localização atualizada
- `alert:new` - Novo alerta criado
- `leaderboard:updated` - Ranking atualizado

---

## 🎮 Sistema de Gamificação

### Mecânicas

#### Pontos
- **Registro de cirurgia**: 100 pts
- **Cirurgia com fotos**: +50 pts
- **Feedback detalhado**: +30 pts
- **Primeiro registro do dia**: +20 pts
- **Sequência de dias consecutivos**: +10 pts/dia

#### Níveis
- Nível 1: 0-500 pts (Iniciante)
- Nível 2: 501-1500 pts (Intermediário)
- Nível 3: 1501-3000 pts (Avançado)
- Nível 4: 3001-5000 pts (Expert)
- Nível 5: 5001+ pts (Mestre)

#### Badges/Conquistas
- 🏅 **Primeira Cirurgia** - Registrar primeira cirurgia
- 🔥 **Série de Fogo** - 7 dias consecutivos registrando
- 📸 **Fotógrafo** - 50 cirurgias com fotos
- 🎯 **Precisão** - 100 cirurgias registradas
- ⭐ **Superstar** - Top 10 no ranking mensal
- 🏆 **Campeão** - #1 no ranking
- 🔍 **Detetive** - Reportar 10 problemas com dispositivos
- 💯 **Centenário** - 100 cirurgias registradas

#### Missões Temporárias
- Missões semanais com objetivos específicos
- Recompensas em pontos extras
- Desafios de equipe

---

## 🚀 Deployment e DevOps

### Ambientes
- **Desenvolvimento**: Local com Docker Compose
- **Staging**: Ambiente de testes (Azure/AWS)
- **Produção**: Cluster com alta disponibilidade

### Pipeline CI/CD

```
GitHub Push → GitHub Actions
    │
    ├──> Lint & Type Check
    ├──> Unit Tests
    ├──> Integration Tests
    ├──> Build Docker Image
    ├──> Push to Registry
    └──> Deploy to Environment
```

### Monitoramento
- **Logs**: Winston + CloudWatch/Azure Monitor
- **APM**: Sentry para erros
- **Métricas**: Prometheus + Grafana
- **Uptime**: UptimeRobot ou Pingdom
- **Analytics**: Mixpanel ou Amplitude

---

## 📊 Performance e Escalabilidade

### Otimizações Frontend
- Code splitting e lazy loading
- Service Worker para cache offline
- Compressão de imagens antes do upload
- Debounce em geolocalização
- Virtual scrolling para listas grandes

### Otimizações Backend
- Índices no banco de dados (geoespaciais, barcode, timestamps)
- Query optimization com Prisma
- Cache Redis para rankings e dashboards
- Rate limiting para proteção
- CDN para assets estáticos
- Compressão Gzip/Brotli

### Escalabilidade
- **Horizontal**: Múltiplas instâncias da API
- **Load Balancer**: NGINX ou cloud-native
- **Database**: Read replicas para consultas
- **Cache**: Redis cluster
- **Storage**: S3 com CloudFront

---

## 🔧 Configuração e Variáveis de Ambiente

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/instrumenta_sin
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=instrumenta-sin-uploads

# API
PORT=3000
NODE_ENV=production
API_URL=https://api.instrumenta-sin.com

# WebSocket
WS_PORT=3001

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Frontend (.env)
```env
VITE_API_URL=https://api.instrumenta-sin.com
VITE_WS_URL=wss://api.instrumenta-sin.com
VITE_MAPBOX_TOKEN=your-mapbox-token
```

---

## 📱 PWA - Progressive Web App

### Funcionalidades PWA
- ✅ Instalável (Add to Home Screen)
- ✅ Offline-first com Service Worker
- ✅ Push Notifications
- ✅ Background Sync para envio de dados
- ✅ Responsivo (Mobile-first)
- ✅ Fast loading

### Manifest
```json
{
  "name": "Instrumenta-Sin",
  "short_name": "Instrumenta",
  "description": "Monitoramento de Dispositivos Médicos",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "icons": [...]
}
```

---

## 🧪 Testes

### Estratégia de Testes
- **Unit Tests**: Vitest (frontend) + Jest (backend)
- **Integration Tests**: Supertest (API)
- **E2E Tests**: Playwright ou Cypress
- **Coverage**: Mínimo 80%

### Testes Críticos
- Autenticação e autorização
- Registro de cirurgias
- Cálculo de pontos gamificação
- WebSocket em tempo real
- Geolocalização e queries espaciais
- Upload de imagens

