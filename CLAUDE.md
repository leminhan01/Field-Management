# FieldApp - Hệ thống Quản lý Công việc Agency

## Tổng quan dự án

Hệ thống quản lý công việc dành cho đơn vị agency chuyên về dịch vụ BB (Below-the-line), BG (Brand Growth), tiếp thị và quảng bá sản phẩm. Hệ thống hỗ trợ quản lý nhân viên, phân công công việc theo cửa hàng/chi nhánh, quản lý thiết bị, và theo dõi báo cáo thực hiện.

## Kiến trúc hệ thống

```
FieldApp/
├── apps/
│   ├── web/                    # Next.js frontend (App Router)
│   │   ├── src/
│   │   │   ├── app/            # Pages & layouts (App Router)
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities, API client, auth
│   │   │   ├── stores/         # State management (Zustand)
│   │   │   └── types/          # Frontend TypeScript types
│   │   ├── public/             # Static assets
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── modules/        # Feature modules
│       │   ├── common/         # Shared guards, interceptors, decorators
│       │   ├── config/         # Configuration (DB, JWT, etc.)
│       │   ├── database/       # Migrations, seeds
│       │   └── main.ts
│       ├── nest-cli.json
│       └── package.json
│
├── packages/                   # Shared packages (monorepo)
│   └── shared/                 # Shared types, constants, utils
│       ├── src/
│       │   ├── types/          # Shared TypeScript interfaces
│       │   ├── constants/      # Enums, status codes, roles
│       │   └── utils/          # Shared utility functions
│       └── package.json
│
├── docker/                     # Docker configurations
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.web
│   └── Dockerfile.api
│
├── docs/                       # Documentation
├── CLAUDE.md
├── package.json                # Root workspace config
├── turbo.json                  # Turborepo config
└── .env.example
```

## Công nghệ sử dụng

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Frontend | Next.js (App Router) | 15.x |
| Backend | NestJS | 10.x |
| Database | PostgreSQL | 16.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| State Management | Zustand | 4.x |
| UI Library | Tailwind CSS 3 | - |
| Monorepo | Turborepo + pnpm workspace | - |
| Container | Docker + Docker Compose | - |
| Auth | JWT (access + refresh token) | - |
| Validation | class-validator (backend) + Zod (frontend) | - |

## Thiết kế giao diện (UI/UX)

### Layout tổng thể
- **Sidebar** (trái, fixed ≈240px): Menu điều hướng với các nhóm mục mở/thu gọn
- **Header** (trên): Logo, breadcrumb, thông tin user, language toggle
- **Main Content**: Action bar (nút chức năng + search) + Data table + Pagination

### Bảng màu (Color Palette)
- **Primary**: `#2563EB` (blue-600) - nút action, sidebar active, link
- **Primary Hover**: `#1D4ED8` (blue-700)
- **Background**: `#FFFFFF` (sidebar, content) / `#F9FAFB` (gray-50, table bg)
- **Text Primary**: `#374151` (gray-700)
- **Text Secondary**: `#9CA3AF` (gray-400)
- **Accent**: `#8B5CF6` (violet-500) - avatar, badge
- **Border**: `#E5E7EB` (gray-200)
- **Success**: `#10B981` / **Warning**: `#F59E0B` / **Error**: `#EF4444`

### Font & Icons
- Font: Inter (sans-serif)
- Icons: Lucide React (Feather-style), kích thước 16-20px
- Bảng: sans-serif, cỡ chữ 14px

### Thiết kế components chính

#### Sidebar Navigation
- Nhóm menu: **Management** (Dashboard, Employee, Task, Survey, Assignment) và **Others** (Setting, Branch, Restaurant, Devices)
- Menu con thu gọn/mở (expandable/collapsible) với mũi tên
- Mục active: text màu primary blue
- Badge hiển thị role (vd: "All Admin", "All Stores Management")

#### Data Table
- Columns: Checkbox (bulk select), data columns, Actions (3-dot menu)
- Hover row: background `#F3F4F6`
- Pagination: góc dưới phải, số trang + mũi tên điều hướng

#### Action Bar
- Nút primary (Assign/Create): nền blue, icon plus
- Nút secondary (Refresh): outlined, border gray
- Search input: icon kính lúp, placeholder "Search...", focus border blue

#### Header
- Logo + tên hệ thống (trái)
- Breadcrumb đường dẫn (giữa)
- Avatar tròn + tên user + role (phải)

## Các module chức năng

### 1. Authentication & Authorization
- Đăng nhập/Đăng xuất (JWT access + refresh token)
- Phân quyền theo role: Super Admin, Admin, Manager, Team Leader, Staff
- Mỗi role có quyền truy cập module khác nhau (RBAC)

### 2. Dashboard
- Thống kê tổng quan: số nhân sự, công việc, cửa hàng, tỷ lệ hoàn thành
- Biểu đồ: công việc theo trạng thái, hiệu suất theo tháng, top nhân viên
- Quick actions: tạo công việc nhanh, phân công nhanh

### 3. Quản lý Nhân viên (Employee Management)
- Danh sách nhân viên: lọc theo chi nhánh, role, trạng thái
- CRUD nhân viên: thông tin cá nhân, role, chi nhánh trực thuộc
- Import/Export nhân viên (Excel)
- Phân công nhân viên vào nhóm/cửa hàng

### 4. Quản lý Công việc (Task Management)
- **Regular Task**: Công việc định kỳ (chăm sóc cửa hàng, kiểm tra trưng bày, sampling)
- **Scheduling**: Lên lịch phân công theo tuần/tháng
- **Device Task**: Công việc liên quan thiết bị (kiểm tra camera, thiết bị trưng bày)
- **Report**: Báo cáo kết quả thực hiện công việc
- Trạng thái công việc: Draft → Assigned → In Progress → Completed → Approved/Rejected
- Gán công việc cho nhân viên + cửa hàng + thiết bị

### 5. Quản lý Mẫu Công việc (Task Template)
- Tạo mẫu công việc mẫu cho từng loại dịch vụ (BB, BG, promotion)
- Template bao gồm: tên, mô tả, checklist, yêu cầu hình ảnh, thời gian thực hiện
- Sử dụng template khi tạo công việc mới

### 6. Quản lý Cửa hàng (Store/Branch Management)
- Danh sách cửa hàng/chi nhánh (Restaurant, Supermarket, etc.)
- Thông tin: tên, địa chỉ, loại hình, khu vực, người phụ trách
- Phân nhóm: theo khu vực, loại hình, thương hiệu
- Import/Export danh sách cửa hàng

### 7. Quản lý Thiết bị (Device Management)
- Danh sách thiết bị theo cửa hàng: camera, màn hình, standee, kệ trưng bày
- Trạng thái thiết bị: Active, Maintenance, Broken
- Liên kết thiết bị với công việc (Device Task)

### 8. Survey (Khảo sát)
- Tạo mẫu khảo sát: câu hỏi, loại câu hỏi, điều kiện hiển thị
- Phân công khảo sát cho nhân viên tại cửa hàng
- Thu thập và thống kê kết quả khảo sát

### 9. Cài đặt (Settings)
- Quản lý khu vực (Region/Area)
- Quản lý loại hình cửa hàng
- Quản lý loại công việc, trạng thái
- Cấu hình hệ thống: ngôn ngữ, timezone, notification

## Database Schema (Các entity chính)

```
User            - Thông tin nhân viên (name, email, phone, role, branch_id)
Branch          - Cửa hàng/Chi nhánh (name, address, type, region, manager_id)
Task            - Công việc (title, type, template_id, status, assignee_id, branch_id)
TaskTemplate    - Mẫu công việc (name, type, checklist, requirements)
TaskAssignment  - Phân công (task_id, user_id, branch_id, scheduled_date, start_time, end_time)
Device          - Thiết bị (name, type, serial, status, branch_id)
Survey          - Khảo sát (title, questions, status)
SurveyResponse  - Kết quả khảo sát (survey_id, user_id, branch_id, answers)
Report          - Báo cáo (task_id, user_id, photos, notes, submitted_at)
Region          - Khu vực (name, code, parent_id)
```

## Quy ước phát triển

### Naming Conventions
- **Files**: kebab-case (`task-template.service.ts`, `use-task-filter.ts`)
- **Components**: PascalCase (`TaskTable.tsx`, `EmployeeForm.tsx`)
- **Hooks**: camelCase với prefix `use` (`useAuth`, `useTaskList`)
- **API Routes**: kebab-case, RESTful (`/api/v1/task-templates`, `/api/v1/employees`)
- **Database Tables**: snake_case, số nhiều (`task_templates`, `branch_devices`)
- **Environment Variables**: SCREAMING_SNAKE_CASE (`DATABASE_URL`, `JWT_SECRET`)

### API Response Format
```typescript
// Success
{ success: true, data: T, message: "string" }

// Paginated
{ success: true, data: T[], meta: { page, limit, total, totalPages } }

// Error
{ success: false, error: { code: "string", message: "string", details?: unknown } }
```

### Git Convention
- Branch: `feature/<module>-<mô-tả>`, `fix/<mô-tả>`, `chore/<mô-tả>`
- Commit message (Conventional Commits):
  - `feat(task): add task template CRUD`
  - `fix(auth): refresh token rotation bug`
  - `chore(docker): update dev compose config`
- PR title format: `[Module] Mô tả ngắn` (vd: `[Task] Add task template management`)

### Code Style
- TypeScript strict mode bắt buộc
- ESLint + Prettier (cấu hình shared trong monorepo)
- Không sử dụng `any`, dùng `unknown` khi cần type không xác định
- Prefer `interface` cho object shapes, `type` cho unions/intersections
- Components: functional components với arrow functions
- Services: injectable classes (NestJS)
- Mỗi NestJS module gồm: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.entity.ts`

### Frontend Conventions
- App Router: mỗi route có `page.tsx` + `layout.tsx`
- Server Components mặc định, thêm `"use client"` chỉ khi cần interactivity
- Component phân tầng: `Layout > Page > Section > Card > UI primitive`
- API calls tập trung qua `src/lib/api-client.ts` (axios instance + interceptors)
- State: Zustand cho global state, React state cho local UI state
- Form: React Hook Form + Zod validation

### Backend Conventions
- NestJS modules theo feature (auth, users, tasks, branches, devices, surveys, reports)
- DTO với class-validator cho mọi request body/query
- Prisma schema là nguồn chân lý cho database types
- Guard cho authentication (@JwtGuard) và authorization (@RolesGuard)
- Pagination: dùng cursor-based cho danh sách lớn, offset cho quản trị
- Soft delete: thêm `deleted_at` column, dùng Prisma middleware

## Lệnh thường dùng

```bash
# Development
pnpm install                      # Cài đặt dependencies (root)
pnpm dev                          # Chạy tất cả services (turborepo)
pnpm dev:web                      # Chỉ chạy frontend
pnpm dev:api                      # Chỉ chạy backend

# Docker
docker compose -f docker/docker-compose.dev.yml up -d   # Khởi tạo DB + services
docker compose -f docker/docker-compose.dev.yml down     # Dừng services

# Database
pnpm db:push                      # Push schema changes (dev)
pnpm db:migrate                   # Chạy migration
pnpm db:seed                      # Seed dữ liệu mẫu
pnpm db:studio                    # Mở Prisma Studio

# Build & Lint
pnpm build                        # Build tất cả
pnpm lint                         # Lint tất cả
pnpm lint:fix                     # Lint và tự sửa

# Testing
pnpm test                         # Chạy tests
pnpm test:web                     # Test frontend
pnpm test:api                     # Test backend
```

## Biến môi trường (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fieldapp

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRY=7d

# App
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
PORT=3001

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## Ghi chú quan trọng

- Hệ thống hỗ trợ đa ngôn ngữ (Vietnamese mặc định, English)
- Mọi API endpoint đều yêu cầu authentication trừ `/auth/login`, `/auth/refresh`
- Upload ảnh cho báo cáo công việc: tối đa 10MB, accept jpg/png/webp
- Timezone mặc định: Asia/Ho_Chi_Minh (UTC+7)
- Ngày tháng hiển thị theo format DD/MM/YYYY, thời gian HH:mm:ss
