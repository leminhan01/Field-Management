# FieldApp - He thong Quan ly Cong viec Agency

He thong quan ly cong viec danh cho don vi agency chuyen dich vu BB (Below-the-line), BG (Brand Growth), tiep thi va quang ba san pham.

## Cong nghe su dung

| Layer | Cong nghe |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + Ant Design 5 + Tailwind CSS 3 |
| Backend | NestJS 11 + Prisma 6 |
| Database | PostgreSQL 16 |
| Language | TypeScript 5 |
| Monorepo | Turborepo + pnpm workspace |
| Container | Docker + Docker Compose |

## Yeu cau truoc khi cai dat

- **Node.js** >= 22.x
- **pnpm** >= 10.x
- **Docker** (de chay PostgreSQL)

```bash
# Kiem tra phien ban
node -v
pnpm -v
docker -v
```

## Huong dan chay du an

### 1. Clone va cai dat dependencies

```bash
# Clone repository
git clone <repo-url>
cd FieldApp

# Cai dat tat ca dependencies
pnpm install
```

### 2. Khoi dong PostgreSQL

```bash
# Start PostgreSQL container
docker compose -f docker/docker-compose.dev.yml up -d

# Kiem tra container dang chay
docker compose -f docker/docker-compose.dev.yml ps
```

PostgreSQL se chay tai `localhost:5432` voi:
- User: `postgres`
- Password: `postgres`
- Database: `fieldapp`

### 3. Cau hinh environment

File `.env` da duoc tao san tai `apps/api/.env` voi gia tri default phu hop cho development. Neu can thay doi:

```bash
# Backend env
cp apps/api/.env apps/api/.env.local
# Chinh sua apps/api/.env.local theo y muon

# Frontend env
cp apps/web/.env.local apps/web/.env.development.local
```

### 4. Khoi tao database

```bash
# Push Prisma schema len database
cd apps/api
npx prisma db push

# Tao du lieu mau (seed)
npx prisma db seed

# Quay ve root
cd ../..
```

### 5. Chay development servers

```bash
# Chay ca Backend va Frontend cung luc
pnpm dev
```

Hoac chay rieng le:

```bash
# Chi Backend (port 3001)
pnpm dev:api

# Chi Frontend (port 3000)
pnpm dev:web
```

### 6. Truy cap ung dung

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Swagger Docs**: http://localhost:3001/api/docs

## Tai khoan mau

Sau khi chay seed, cac tai khoan sau se duoc tao:

| Email | Mat khau | Role |
|-------|----------|------|
| admin@fieldapp.com | admin123 | SUPER_ADMIN |
| manager@fieldapp.com | manager123 | MANAGER |
| teamleader@fieldapp.com | teamleader123 | TEAM_LEADER |
| staff@fieldapp.com | staff123 | STAFF |

## Cau truc du an

```
FieldApp/
├── apps/
│   ├── api/                     # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Database schema
│   │   │   └── seed.ts          # Seed data
│   │   └── src/
│   │       ├── modules/         # Feature modules (auth, ...)
│   │       ├── common/          # Guards, decorators, interceptors
│   │       ├── config/          # Configuration
│   │       └── main.ts
│   │
│   └── web/                     # Next.js Frontend
│       └── src/
│           ├── app/             # Pages (App Router)
│           ├── components/      # React components
│           ├── hooks/           # Custom hooks
│           ├── lib/             # API client, helpers
│           ├── stores/          # Zustand state management
│           └── types/           # TypeScript types
│
├── packages/
│   └── shared/                  # Shared types, constants, utils
│
├── docker/                      # Docker configurations
├── package.json                 # Root workspace config
├── turbo.json                   # Turborepo config
└── pnpm-workspace.yaml          # pnpm workspace config
```

## Cac lenh thuong dung

```bash
# Development
pnpm dev                  # Chay tat ca services
pnpm dev:api              # Chi Backend
pnpm dev:web              # Chi Frontend

# Build
pnpm build                # Build tat ca
pnpm build:api            # Chi Backend
pnpm build:web            # Chi Frontend

# Database
pnpm db:push              # Push schema changes (dev)
pnpm db:seed              # Seed du lieu mau
pnpm db:studio            # Mo Prisma Studio (GUI)

# Code quality
pnpm lint                 # Lint tat ca
pnpm lint:fix             # Lint va tu sua
```

## API Endpoints (Auth)

| Method | Endpoint | Mo ta | Auth |
|--------|----------|-------|------|
| POST | /api/v1/auth/login | Dang nhap | Khong |
| POST | /api/v1/auth/register | Tao tai khoan | Admin+ |
| POST | /api/v1/auth/refresh | Refresh token | Khong |
| POST | /api/v1/auth/logout | Dang xuat | Co |
| GET | /api/v1/auth/me | Thong tin user hien tai | Co |
| PATCH | /api/v1/auth/change-password | Doi mat khau | Co |

## Dung du an

```bash
# Dung development servers (Ctrl+C trong terminal)

# Dung PostgreSQL container
docker compose -f docker/docker-compose.dev.yml down

# Dung va xoa data
docker compose -f docker/docker-compose.dev.yml down -v
```
