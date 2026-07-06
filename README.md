# FieldApp — Hệ thống Quản lý Công việc Agency

Hệ thống quản lý công việc và nhân sự dành cho đơn vị agency chuyên dịch vụ **BB** (Below-the-line), **BG** (Brand Growth), tiếp thị và quảng bá sản phẩm. Hỗ trợ phân công công việc theo cửa hàng/điểm bán, quản lý nhân viên, mẫu công việc, khảo sát, check-in GPS, chụp ảnh minh chứng và duyệt báo cáo.

Dự án là một **monorepo (Turborepo + pnpm)** gồm 3 ứng dụng và 1 package dùng chung:

| Ứng dụng | Vai trò | Công nghệ |
|----------|---------|-----------|
| **Web Admin** (`apps/web`) | Cho quản lý/admin điều hành hệ thống | Next.js 15 (App Router) |
| **Mobile App** (`apps/mobile`) | Cho nhân viên tiếp thị (field staff) làm việc tại điểm bán | Expo SDK 56 + React Native |
| **API Backend** (`apps/api`) | Phục vụ cả Web và Mobile | NestJS 11 + Prisma |
| **Shared** (`packages/shared`) | Types, constants, utils dùng chung | TypeScript |

---

## ✨ Tính năng chính

### Web Admin

- **Dashboard** — Tổng quan vận hành: số nhân sự, điểm bán, công việc trong tuần, tiến độ theo trạng thái, tác vụ nhanh, cảnh báo.
- **Quản lý nhân viên** — CRUD, lọc (role/chi nhánh/trạng thái), **import/export Excel**, tải avatar, trang chi tiết.
- **Quản lý công việc (Tasks)** — Danh sách Regular Task với bộ lọc nâng cao, chi tiết công việc.
- **Lên lịch (Scheduling)** — Phân công hàng loạt: chọn chi nhánh + nhân viên + điểm bán + mẫu/nhóm công việc + chế độ lịch (`SINGLE` / `RANGE` / `WEEKLY` theo thứ trong tuần) + thời gian.
- **Mẫu công việc (Task Templates)** — Quản lý Template và Group, gán nhóm công việc.
- **Báo cáo (Reports)** — Hàng đợi duyệt báo cáo, approve/reject kèm ghi chú.
- **Khảo sát (Surveys)** — CRUD khảo sát, vòng đời trạng thái, xem câu trả lời & thống kê.
- **Chi nhánh (Branches)** & **Điểm bán (Outlets)** — CRUD riêng biệt (Outlet có tọa độ GPS để check-in).
- **Vị trí & quyền (Positions)** — Quản lý vị trí, gán quyền (RBAC) theo module, bật/tắt trạng thái.
- **Cài đặt (Settings)** — Cấu hình chung, thông báo, bảo mật.
- **Xác thực** — Đăng nhập JWT, refresh token tự động, bảo vệ route phía client.

### Mobile App (Field Staff)

- **Đăng nhập** an toàn với lưu token qua `expo-secure-store`, tự refresh khi hết hạn.
- **Tasks** — Xem công việc được phân công, chi tiết, cập nhật trạng thái, nộp báo cáo + ảnh minh chứng.
- **Surveys** — Làm khảo sát được giao.
- **Chụp ảnh** minh chứng qua camera/gallery với giới hạn số lượng.
- **GPS** — Lấy vị trí hiện tại, tìm điểm bán gần đây, check-in (màn hình đã có sẵn).
- **Thông báo**, **Hồ sơ** (đổi mật khẩu, cài đặt).

### API Backend

15 module đã đăng ký: `auth`, `employees`, `branches`, `outlets`, `positions`, `task-templates`, `task-groups`, `tasks`, `task-assignments`, `reports`, `surveys`, `dashboard`, `upload`, `me`. Toàn bộ endpoint nằm dưới `/api/v1` và có Swagger tại `/api/docs`.

---

## 🧱 Công nghệ sử dụng

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Web Admin | Next.js (App Router) + React + TypeScript | 15.x / 19.x / 5.x |
| Web UI | Tailwind CSS + shadcn/ui (Radix) + framer-motion | 3.4 / 12.x |
| Web State | Zustand + React Hook Form + Zod | 5.x / 7.x / 3.x |
| Mobile | Expo SDK + React Native + React Navigation | 56 / 0.85 / 7 |
| Mobile UI | React Native Paper + TanStack Query + Zustand | 5.x / 5.x / 5.x |
| Backend | NestJS + Prisma ORM | 11.x / 6.x |
| Database | PostgreSQL | 16 |
| Auth | JWT (access 15m + refresh 7d) + Passport + bcryptjs | — |
| Media | Cloudinary (upload & phân phối ảnh) | — |
| Excel | `xlsx` (import/export nhân viên) | — |
| API Docs | Swagger (`@nestjs/swagger`) | — |
| Monorepo | Turborepo + pnpm workspace | 2.x / 10.x |
| Container/CI | Docker + Docker Compose + GitHub Actions | — |

---

## 📁 Cấu trúc dự án

```
FieldApp/
├── apps/
│   ├── api/                      # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # 16 models + 9 enums
│   │   │   └── seed.ts           # Dữ liệu mẫu
│   │   └── src/
│   │       ├── modules/          # 15 feature modules
│   │       ├── common/           # Guards, decorators, filters, interceptors, Prisma
│   │       ├── config/           # Cấu hình (DB, JWT, Cloudinary…)
│   │       └── main.ts           # Global prefix /api/v1, Swagger, CORS
│   │
│   ├── web/                      # Next.js Admin
│   │   └── src/
│   │       ├── app/              # App Router (route group (dashboard))
│   │       ├── components/       # ui (shadcn), layout, shared, theo feature
│   │       ├── hooks/            # Data + mutation hooks theo feature
│   │       ├── lib/              # api-client, auth, API modules theo domain
│   │       ├── stores/           # Zustand (auth, sidebar)
│   │       └── types/
│   │
│   └── mobile/                   # Expo + React Native (Field Staff)
│       ├── app.config.ts         # Expo dynamic config (permissions, extra)
│       └── src/
│           ├── screens/          # auth, tasks, surveys, checkin, profile…
│           ├── navigation/       # Stack + Bottom Tabs
│           ├── hooks/ services/ stores/ components/ utils/
│
├── packages/
│   └── shared/                   # @fieldapp/shared: types, constants, utils
│
├── docker/                       # Dockerfiles + compose (dev & prod)
├── .github/workflows/deploy.yml  # CI/CD build & deploy
├── package.json                  # Root workspace scripts
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## ✅ Yêu cầu hệ thống

- **Node.js** ≥ 22.x
- **pnpm** ≥ 10.x (khuyến nghị dùng [corepack](https://nodejs.org/api/corepack.html))
- **Docker** + Docker Compose (để chạy PostgreSQL)

```bash
node -v   # >= 22
pnpm -v   # >= 10
docker -v
```

---

## 🚀 Hướng dẫn cài đặt & chạy (Development)

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd FieldApp
pnpm install
```

### 2. Khởi động PostgreSQL

```bash
docker compose -f docker/docker-compose.dev.yml up -d
docker compose -f docker/docker-compose.dev.yml ps
```

PostgreSQL chạy tại `localhost:5432`:

- User: `postgres` · Password: `postgres` · Database: `fieldapp`
- (Tuỳ chọn) pgAdmin tại `http://localhost:5050` — chạy với profile `debug`:
  `docker compose -f docker/docker-compose.dev.yml --profile debug up -d`

### 3. Cấu hình biến môi trường

File `.env` đã có sẵn tại `apps/api/.env` với giá trị mặc định phù hợp dev. Cần cấu hình Cloudinary cho upload ảnh:

```bash
# Backend
cp apps/api/.env apps/api/.env.local   # rồi chỉnh sửa nếu cần

# Frontend
cp apps/web/.env.local apps/web/.env.development.local
```

### 4. Khởi tạo database

```bash
cd apps/api
npx prisma db push      # đẩy schema
npx prisma db seed      # tạo dữ liệu mẫu
cd ../..
```

### 5. Chạy development servers

```bash
pnpm dev        # chạy cả Web + API + Mobile
```

Hoặc chạy riêng:

```bash
pnpm dev:api    # Backend (port 3001)
pnpm dev:web    # Frontend (port 3000)
pnpm dev:mobile # Mobile (Expo dev client)
```

### 6. Truy cập ứng dụng

| Dịch vụ | URL |
|---------|-----|
| Web Admin | http://localhost:3000 |
| API Backend | http://localhost:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs |

---

## 👤 Tài khoản mẫu

Sau khi chạy `prisma db seed`:

| Email | Mật khẩu | Role |
|-------|----------|------|
| admin@fieldapp.com | admin123 | SUPER_ADMIN |
| manager@fieldapp.com | manager123 | MANAGER |
| teamleader@fieldapp.com | teamleader123 | TEAM_LEADER |
| staff@fieldapp.com | staff123 | STAFF |

---

## 🔐 Biến môi trường

Tham khảo `.env.example`. Các biến chính:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fieldapp

# JWT
JWT_ACCESS_SECRET=...        JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=...       JWT_REFRESH_EXPIRY=7d

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Cloudinary (upload ảnh)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend (Web)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

# Mobile (Expo)
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 📡 Tổng quan API

Tất cả endpoint nằm dưới tiền tố `/api/v1`. Trừ `auth/login`, `auth/refresh`, mọi endpoint đều yêu cầu JWT (Bearer token). **Xem đầy đủ tại Swagger: `/api/docs`.**

| Module | Nhóm endpoint | Mô tả |
|--------|---------------|-------|
| **Auth** | `/auth/*` | login, register, refresh, logout, me, change-password |
| **Employees** | `/employees/*` | CRUD + import/export Excel + avatar |
| **Branches** | `/branches/*` | CRUD chi nhánh |
| **Outlets** | `/outlets/*` | CRUD điểm bán (có GPS) |
| **Positions** | `/positions/*` | CRUD vị trí + quyền (RBAC) |
| **Task Templates** | `/task-templates/*` | CRUD mẫu công việc |
| **Task Groups** | `/task-groups/*` | CRUD nhóm + gán nhóm |
| **Task Assignments** | `/task-assignments/bulk` | Phân công hàng loạt |
| **Tasks** | `/tasks/*` | Xem/xoá công việc |
| **Reports** | `/reports/*` | Xem + duyệt báo cáo |
| **Surveys** | `/surveys/*` | CRUD + vòng đời + responses + stats |
| **Dashboard** | `/dashboard` | Tổng quan thống kê |
| **Upload** | `/upload/image` | Upload ảnh (Cloudinary, tối đa 10MB) |
| **Me** (Mobile) | `/me/*` | Tasks, check-in, reports, sync, surveys, nearby outlets, device-token của user hiện tại |

### Auth Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/v1/auth/login` | Đăng nhập | Không |
| POST | `/api/v1/auth/refresh` | Làm mới access token | Không |
| POST | `/api/v1/auth/register` | Tạo tài khoản | Admin+ |
| POST | `/api/v1/auth/logout` | Đăng xuất | Có |
| GET | `/api/v1/auth/me` | Thông tin user hiện tại | Có |
| PATCH | `/api/v1/auth/change-password` | Đổi mật khẩu | Có |

---

## 📱 Chạy Mobile App

```bash
pnpm dev:mobile
# hoặc
cd apps/mobile && npx expo start --dev-client
```

Yêu cầu **development build** (không dùng Expo Go) vì có native modules (camera, location, secure-store). Để build:

```bash
cd apps/mobile
eas build --platform android --profile development
eas build --platform ios     --profile development
```

> Lưu ý: app mobile hiện **online-first** (dùng React Query cache). Endpoint `/me/sync` đã có ở backend để hỗ trợ delta-sync nhưng client chưa kích hoạt offline queue đầy đủ.

---

## 🛠 Lệnh thường dùng

```bash
# Development
pnpm dev                # Chạy tất cả
pnpm dev:web            # Chỉ Web
pnpm dev:api            # Chỉ API
pnpm dev:mobile         # Chỉ Mobile

# Build
pnpm build              # Build tất cả
pnpm build:web          # Chỉ Web
pnpm build:api          # Chỉ API

# Database
pnpm db:push            # Đẩy schema (dev)
pnpm db:migrate         # Tạo migration
pnpm db:seed            # Seed dữ liệu mẫu
pnpm db:studio          # Mở Prisma Studio (GUI)

# Code quality
pnpm lint               # Lint tất cả
pnpm lint:fix           # Lint + tự sửa
pnpm type-check         # Kiểm tra kiểu TypeScript
pnpm test               # Chạy test
```

---

## 🐳 Triển khai (Production)

Hệ thống deploy theo mô hình **image-based CI/CD**:

1. **Build** — Push lên nhánh `main` (hoặc trigger thủ công) kích hoạt `.github/workflows/deploy.yml`. GitHub Actions build 2 image Docker (web + api) và đẩy lên **GHCR** (`ghcr.io/leminhan01/fieldapp-{api,web}`) với tag `latest` + `sha-<commit>`.
2. **Deploy** — Workflow SSH vào VPS, ghi `docker/docker-compose.prod.yml` tại `/opt/projects/fieldapp/`, `docker compose pull` + `up -d --remove-orphans`.
3. **Networking** — Compose production join 2 network ngoài: `proxy` (Nginx Proxy Manager điều hướng theo tên container/subdomain) và `internal` (PostgreSQL cho API). API chạy `prisma migrate deploy` tự động trong `entrypoint.api.sh` trước khi khởi động.

Build images thủ công (dev):

```bash
docker compose -f docker/docker-compose.prod.yml build
docker compose -f docker/docker-compose.prod.yml up -d
```

---

## 🛑 Dừng dự án

```bash
# Dừng dev servers: Ctrl+C trong terminal

# Dừng PostgreSQL container
docker compose -f docker/docker-compose.dev.yml down

# Dừng và xoá data
docker compose -f docker/docker-compose.dev.yml down -v
```

---

## 📜 Quy ước phát triển

- **Branch**: `feature/<module>-<mô-tả>`, `fix/<mô-tả>`, `chore/<mô-tả>`
- **Commit** (Conventional Commits): `feat(task): ...`, `fix(auth): ...`, `chore(docker): ...`
- **TypeScript strict**, không dùng `any`
- Backend: mỗi module gồm `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTO dùng `class-validator`
- Frontend: App Router, Server Components mặc định, `"use client"` khi cần; API gọi tập trung qua `src/lib/api-client.ts`
- API response chuẩn: `{ success, data, message }` / phân trang `{ data, meta: { page, limit, total, totalPages } }`
- Đa ngôn ngữ: Tiếng Việt (mặc định) / English. Timezone `Asia/Ho_Chi_Minh` (UTC+7)

---

## 📄 License

Dự án nội bộ — ISC.
