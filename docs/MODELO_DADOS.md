# Modelo de Dados - Instrumenta-Sin

## 🗄️ Schema do Banco de Dados (PostgreSQL + PostGIS)

### Diagrama de Entidades e Relacionamentos

```
┌─────────────────┐         ┌──────────────────┐
│     User        │◄────────│   Achievement    │
│─────────────────│  1:N    │──────────────────│
│ id (PK)         │         │ id (PK)          │
│ email           │         │ user_id (FK)     │
│ password_hash   │         │ badge_id (FK)    │
│ role            │         │ earned_at        │
│ name            │         └──────────────────┘
│ phone           │                 │
│ avatar_url      │                 │ N:1
│ active          │                 ▼
│ points          │         ┌──────────────────┐
│ level           │         │      Badge       │
│ created_at      │         │──────────────────│
│ updated_at      │         │ id (PK)          │
└─────────────────┘         │ name             │
        │                   │ description      │
        │ 1:N               │ icon_url         │
        ▼                   │ points_required  │
┌─────────────────┐         │ category         │
│    Surgery      │         │ rarity           │
│─────────────────│         └──────────────────┘
│ id (PK)         │
│ user_id (FK)    │                 
│ device_id (FK)  │         ┌──────────────────┐
│ surgery_date    │         │     Mission      │
│ surgery_type    │         │──────────────────│
│ hospital_name   │         │ id (PK)          │
│ latitude        │         │ title            │
│ longitude       │         │ description      │
│ location_acc    │         │ points_reward    │
│ status          │         │ target_count     │
│ doctor_conduct  │         │ mission_type     │
│ device_perf     │         │ start_date       │
│ problems        │         │ end_date         │
│ notes           │         │ active           │
│ photos          │         └──────────────────┘
│ created_at      │                 │
│ updated_at      │                 │ 1:N
└─────────────────┘                 ▼
        │                   ┌──────────────────┐
        │ N:1               │ MissionProgress  │
        ▼                   │──────────────────│
┌─────────────────┐         │ id (PK)          │
│     Device      │         │ user_id (FK)     │
│─────────────────│         │ mission_id (FK)  │
│ id (PK)         │         │ current_count    │
│ barcode         │         │ completed        │
│ name            │         │ completed_at     │
│ category        │         └──────────────────┘
│ manufacturer    │
│ model           │
│ lot_number      │         ┌──────────────────┐
│ expiration_date │         │    Location      │
│ active          │         │──────────────────│
│ created_at      │         │ id (PK)          │
└─────────────────┘         │ user_id (FK)     │
                            │ latitude         │
                            │ longitude        │
        ┌───────────────────│ accuracy         │
        │                   │ timestamp        │
        │ 1:1               │ geom (PostGIS)   │
        ▼                   └──────────────────┘
┌─────────────────┐                 ▲
│     User        │─────────────────┘
└─────────────────┘        1:N


┌─────────────────┐         ┌──────────────────┐
│  Notification   │         │  PointTransaction│
│─────────────────│         │──────────────────│
│ id (PK)         │         │ id (PK)          │
│ user_id (FK)    │         │ user_id (FK)     │
│ title           │         │ points           │
│ message         │         │ reason           │
│ type            │         │ reference_type   │
│ read            │         │ reference_id     │
│ created_at      │         │ created_at       │
└─────────────────┘         └──────────────────┘
        ▲                           ▲
        └───────────────┬───────────┘
                        │
                   ┌────┴─────┐
                   │   User   │
                   └──────────┘
```

---

## 📊 Schema Prisma Completo

```prisma
// schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

// ==========================================
// ENUMS
// ==========================================

enum UserRole {
  INSTRUMENTADOR
  ADMIN
  SUPERVISOR
}

enum SurgeryStatus {
  SUCESSO
  PROBLEMA
  COMPLICACAO
}

enum DeviceCategory {
  ORTOPEDIA
  CARDIOLOGIA
  NEUROLOGIA
  GASTROENTEROLOGIA
  UROLOGIA
  OUTROS
}

enum BadgeRarity {
  COMUM
  RARO
  EPICO
  LENDARIO
}

enum NotificationType {
  ACHIEVEMENT
  MISSION_COMPLETE
  LEVEL_UP
  ALERT
  INFO
}

enum MissionType {
  REGISTER_SURGERIES    // Registrar X cirurgias
  CONSECUTIVE_DAYS      // X dias consecutivos
  UPLOAD_PHOTOS         // Enviar X fotos
  REPORT_PROBLEMS       // Reportar X problemas
  SPECIFIC_CATEGORY     // Usar dispositivos de categoria X
}

enum PointReason {
  SURGERY_REGISTERED
  PHOTO_UPLOADED
  DETAILED_FEEDBACK
  FIRST_OF_DAY
  CONSECUTIVE_DAY
  PROBLEM_REPORTED
  MISSION_COMPLETED
  BADGE_EARNED
  MANUAL_ADJUSTMENT
}

// ==========================================
// CORE ENTITIES
// ==========================================

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  role          UserRole @default(INSTRUMENTADOR)
  
  // Perfil
  name          String
  phone         String?
  avatarUrl     String?  @map("avatar_url")
  active        Boolean  @default(true)
  
  // Gamificação
  points        Int      @default(0)
  level         Int      @default(1)
  
  // Timestamps
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  lastLoginAt   DateTime? @map("last_login_at")
  
  // Relacionamentos
  surgeries           Surgery[]
  locations           Location[]
  achievements        Achievement[]
  notifications       Notification[]
  pointTransactions   PointTransaction[]
  missionProgress     MissionProgress[]
  
  @@map("users")
  @@index([email])
  @@index([role])
  @@index([active])
  @@index([points])
}

model Device {
  id             String          @id @default(uuid())
  barcode        String          @unique
  name           String
  category       DeviceCategory
  manufacturer   String
  model          String
  lotNumber      String?         @map("lot_number")
  expirationDate DateTime?       @map("expiration_date")
  description    String?
  active         Boolean         @default(true)
  
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")
  
  surgeries      Surgery[]
  
  @@map("devices")
  @@index([barcode])
  @@index([category])
  @@index([active])
}

model Surgery {
  id              String         @id @default(uuid())
  userId          String         @map("user_id")
  deviceId        String         @map("device_id")
  
  // Dados da cirurgia
  surgeryDate     DateTime       @map("surgery_date")
  surgeryType     String         @map("surgery_type")
  hospitalName    String         @map("hospital_name")
  hospitalCNPJ    String?        @map("hospital_cnpj")
  
  // Localização
  latitude        Float
  longitude       Float
  locationAccuracy Float?        @map("location_accuracy")
  city            String?
  state           String?
  
  // Avaliação
  status          SurgeryStatus
  doctorName      String?        @map("doctor_name")
  doctorConduct   String         @map("doctor_conduct") // TEXT
  devicePerformance String       @map("device_performance") // TEXT
  problemsReported String?       @map("problems_reported") // TEXT
  notes           String?        // TEXT
  
  // Rating (1-5)
  deviceRating    Int?           @map("device_rating")
  doctorRating    Int?           @map("doctor_rating")
  
  // Evidências
  photos          String[]       // Array de URLs S3
  
  // Metadata
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  
  // Relacionamentos
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  device          Device         @relation(fields: [deviceId], references: [id], onDelete: Restrict)
  
  @@map("surgeries")
  @@index([userId])
  @@index([deviceId])
  @@index([surgeryDate])
  @@index([status])
  @@index([latitude, longitude])
  @@index([createdAt])
}

model Location {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  latitude  Float
  longitude Float
  accuracy  Float?
  timestamp DateTime @default(now())
  
  // PostGIS - geração via raw SQL
  // geom Geography(Point, 4326)
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("locations")
  @@index([userId])
  @@index([timestamp])
  @@index([latitude, longitude])
}

// ==========================================
// GAMIFICAÇÃO
// ==========================================

model Badge {
  id              String        @id @default(uuid())
  name            String        @unique
  description     String
  iconUrl         String        @map("icon_url")
  pointsRequired  Int           @map("points_required")
  category        String
  rarity          BadgeRarity   @default(COMUM)
  order           Int           @default(0) // Para ordenação na UI
  active          Boolean       @default(true)
  
  createdAt       DateTime      @default(now()) @map("created_at")
  
  achievements    Achievement[]
  
  @@map("badges")
  @@index([rarity])
  @@index([pointsRequired])
}

model Achievement {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  badgeId   String   @map("badge_id")
  earnedAt  DateTime @default(now()) @map("earned_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge     Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([userId, badgeId])
  @@map("achievements")
  @@index([userId])
  @@index([badgeId])
  @@index([earnedAt])
}

model Mission {
  id              String          @id @default(uuid())
  title           String
  description     String
  pointsReward    Int             @map("points_reward")
  targetCount     Int             @map("target_count") // Meta a atingir
  missionType     MissionType     @map("mission_type")
  category        String?         // Para missões específicas de categoria
  startDate       DateTime        @map("start_date")
  endDate         DateTime        @map("end_date")
  active          Boolean         @default(true)
  
  createdAt       DateTime        @default(now()) @map("created_at")
  
  progress        MissionProgress[]
  
  @@map("missions")
  @@index([active])
  @@index([startDate, endDate])
  @@index([missionType])
}

model MissionProgress {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  missionId     String   @map("mission_id")
  currentCount  Int      @default(0) @map("current_count")
  completed     Boolean  @default(false)
  completedAt   DateTime? @map("completed_at")
  
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  mission       Mission  @relation(fields: [missionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, missionId])
  @@map("mission_progress")
  @@index([userId])
  @@index([missionId])
  @@index([completed])
}

model PointTransaction {
  id            String      @id @default(uuid())
  userId        String      @map("user_id")
  points        Int         // Pode ser positivo ou negativo
  reason        PointReason
  referenceType String?     @map("reference_type") // 'surgery', 'mission', 'badge', etc
  referenceId   String?     @map("reference_id")
  description   String?
  
  createdAt     DateTime    @default(now()) @map("created_at")
  
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("point_transactions")
  @@index([userId])
  @@index([createdAt])
  @@index([reason])
}

// ==========================================
// NOTIFICAÇÕES E COMUNICAÇÃO
// ==========================================

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  title     String
  message   String
  type      NotificationType
  read      Boolean          @default(false)
  data      Json?            // Dados adicionais (link, ação, etc)
  
  createdAt DateTime         @default(now()) @map("created_at")
  readAt    DateTime?        @map("read_at")
  
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("notifications")
  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

// ==========================================
// CONFIGURAÇÕES E METADATA
// ==========================================

model SystemConfig {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  description String?
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("system_config")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  action    String
  entity    String
  entityId  String?  @map("entity_id")
  changes   Json?    // Before/after
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("audit_logs")
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}
```

---

## 🔍 Índices Adicionais e Performance

### Índices Geoespaciais (PostGIS)

```sql
-- Criar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Adicionar coluna geográfica em locations
ALTER TABLE locations 
ADD COLUMN geom GEOGRAPHY(Point, 4326);

-- Criar índice espacial
CREATE INDEX idx_locations_geom ON locations USING GIST (geom);

-- Trigger para auto-popular geom a partir de lat/lng
CREATE OR REPLACE FUNCTION update_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_geom
BEFORE INSERT OR UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_location_geom();
```

### Índices Compostos para Queries Comuns

```sql
-- Rankings por período
CREATE INDEX idx_users_points_active ON users(points DESC, active) 
WHERE active = true;

-- Cirurgias recentes por usuário
CREATE INDEX idx_surgeries_user_date ON surgeries(user_id, surgery_date DESC);

-- Cirurgias por localização e data (para mapa)
CREATE INDEX idx_surgeries_location_date ON surgeries(latitude, longitude, surgery_date);

-- Missões ativas
CREATE INDEX idx_missions_active_dates ON missions(active, start_date, end_date)
WHERE active = true;

-- Notificações não lidas
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC)
WHERE read = false;
```

---

## 📝 Queries Comuns Otimizadas

### 1. Ranking Global (Leaderboard)

```typescript
// Top 100 usuários por pontos
const leaderboard = await prisma.user.findMany({
  where: { active: true, role: 'INSTRUMENTADOR' },
  select: {
    id: true,
    name: true,
    avatarUrl: true,
    points: true,
    level: true,
    _count: {
      select: { surgeries: true }
    }
  },
  orderBy: { points: 'desc' },
  take: 100
});
```

### 2. Cirurgias no Mapa (Área Geográfica)

```sql
-- Cirurgias dentro de um bounding box
SELECT s.*, u.name as user_name, d.name as device_name
FROM surgeries s
JOIN users u ON s.user_id = u.id
JOIN devices d ON s.device_id = d.id
WHERE s.latitude BETWEEN :minLat AND :maxLat
  AND s.longitude BETWEEN :minLng AND :maxLng
  AND s.surgery_date >= NOW() - INTERVAL '7 days'
ORDER BY s.surgery_date DESC
LIMIT 200;
```

### 3. Dashboard Stats (Admin)

```typescript
const stats = await prisma.$transaction([
  // Total de cirurgias hoje
  prisma.surgery.count({
    where: {
      surgeryDate: {
        gte: new Date(new Date().setHours(0,0,0,0))
      }
    }
  }),
  
  // Usuários ativos (última localização < 1h)
  prisma.location.groupBy({
    by: ['userId'],
    where: {
      timestamp: {
        gte: new Date(Date.now() - 60 * 60 * 1000)
      }
    }
  }),
  
  // Problemas reportados não resolvidos
  prisma.surgery.count({
    where: {
      status: 'PROBLEMA',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  }),
  
  // Média de cirurgias por dia (últimos 30 dias)
  prisma.surgery.groupBy({
    by: ['surgeryDate'],
    where: {
      surgeryDate: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    _count: true
  })
]);
```

### 4. Progresso de Missões do Usuário

```typescript
const userMissions = await prisma.mission.findMany({
  where: {
    active: true,
    startDate: { lte: new Date() },
    endDate: { gte: new Date() }
  },
  include: {
    progress: {
      where: { userId: currentUserId },
      select: {
        currentCount: true,
        completed: true,
        completedAt: true
      }
    }
  }
});
```

---

## 🔄 Migrations Iniciais

### 1. Setup Inicial

```sql
-- migrations/001_initial_setup.sql

-- Criar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar função de atualização de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2. Seed de Badges

```typescript
// seed.ts
const badges = [
  {
    name: 'Primeira Cirurgia',
    description: 'Registrou sua primeira cirurgia',
    iconUrl: '/badges/first-surgery.svg',
    pointsRequired: 0,
    category: 'INICIANTE',
    rarity: 'COMUM'
  },
  {
    name: 'Série de Fogo',
    description: '7 dias consecutivos registrando',
    iconUrl: '/badges/fire-streak.svg',
    pointsRequired: 300,
    category: 'CONSISTENCIA',
    rarity: 'RARO'
  },
  {
    name: 'Fotógrafo',
    description: '50 cirurgias com fotos',
    iconUrl: '/badges/photographer.svg',
    pointsRequired: 800,
    category: 'EVIDENCIA',
    rarity: 'EPICO'
  },
  {
    name: 'Mestre Instrumentador',
    description: '500 cirurgias registradas',
    iconUrl: '/badges/master.svg',
    pointsRequired: 10000,
    category: 'MAESTRIA',
    rarity: 'LENDARIO'
  }
  // ... mais badges
];

await prisma.badge.createMany({ data: badges });
```

---

## 💾 Backup e Retenção de Dados

### Política de Backup
- **Diário**: Backup completo às 03:00 UTC
- **Retenção**: 30 dias para backups diários
- **Semanal**: Backup mantido por 3 meses
- **Mensal**: Backup mantido por 1 ano

### Dados Sensíveis
- **Localização**: Anonimizar após 90 dias
- **Fotos**: Manter por 1 ano, depois arquivar
- **Logs de auditoria**: Manter por 2 anos

---

## 🔐 Segurança de Dados

### Encriptação
- Senhas: bcrypt (cost factor 12)
- Dados em repouso: Encriptação nível DB (AWS RDS)
- Dados em trânsito: TLS 1.3

### Anonimização
```typescript
// Função para anonimizar localização antiga
async function anonymizeOldLocations() {
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  await prisma.location.updateMany({
    where: {
      timestamp: { lt: cutoffDate },
      latitude: { not: 0 }
    },
    data: {
      latitude: 0,
      longitude: 0,
      accuracy: null
    }
  });
}
```

---

## 📊 Views Materializadas (Performance)

```sql
-- View materializada para ranking diário
CREATE MATERIALIZED VIEW daily_leaderboard AS
SELECT 
  u.id,
  u.name,
  u.avatar_url,
  u.points,
  u.level,
  COUNT(s.id) as total_surgeries,
  ROW_NUMBER() OVER (ORDER BY u.points DESC) as rank
FROM users u
LEFT JOIN surgeries s ON u.id = s.user_id
WHERE u.active = true AND u.role = 'INSTRUMENTADOR'
GROUP BY u.id, u.name, u.avatar_url, u.points, u.level
ORDER BY u.points DESC;

-- Índice na view
CREATE INDEX idx_daily_leaderboard_rank ON daily_leaderboard(rank);

-- Refresh automático a cada hora
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Agendar refresh (via pg_cron ou aplicação)
```

Este modelo de dados fornece uma base sólida, escalável e otimizada para a aplicação Instrumenta-Sin! 🚀
