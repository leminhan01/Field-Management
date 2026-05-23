# FieldApp - Hệ thống Quản lý Công việc Agency

## Tổng quan dự án

Hệ thống quản lý công việc dành cho đơn vị agency chuyên về dịch vụ BB (Below-the-line), BG (Brand Growth), tiếp thị và quảng bá sản phẩm. Hệ thống hỗ trợ quản lý nhân viên, phân công công việc theo cửa hàng/chi nhánh, quản lý thiết bị, và theo dõi báo cáo thực hiện.

Hệ thống gồm 3 ứng dụng:
- **Web App (Admin)**: Dành cho quản lý/admin quản trị hệ thống (Next.js)
- **Mobile App (Field Staff)**: Dành cho nhân viên tiếp thị/field staff thực hiện công việc tại cửa hàng (React Native + Expo)
- **API Backend**: NestJS backend phục vụ cả Web App và Mobile App

## Kiến trúc hệ thống

```
FieldApp/
├── apps/
│   ├── web/                    # Next.js frontend (App Router) - Admin
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
│   ├── mobile/                 # React Native + Expo - Field Staff App
│   │   ├── src/
│   │   │   ├── screens/        # Màn hình (screens) theo feature
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── navigation/     # React Navigation config
│   │   │   ├── hooks/          # Custom hooks (useTasks, useLocation, useCamera)
│   │   │   ├── services/       # API client, storage, push notifications
│   │   │   ├── stores/         # State management (Zustand)
│   │   │   ├── utils/          # Utilities (offline, photo, location)
│   │   │   ├── constants/      # Theme, colors, spacing
│   │   │   └── types/          # Mobile-specific TypeScript types
│   │   ├── assets/             # Images, fonts, icons
│   │   ├── app.json            # Expo config
│   │   ├── app.config.ts       # Expo dynamic config
│   │   ├── metro.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                    # NestJS backend (serve cả Web & Mobile)
│       ├── src/
│       │   ├── modules/        # Feature modules
│       │   │   ├── auth/       # Auth (login, refresh, change password)
│       │   │   ├── employees/  # Employee management
│       │   │   ├── branches/   # Branch/Store management
│       │   │   ├── tasks/      # Task CRUD, assignment
│       │   │   ├── task-assignments/  # Task assignment & tracking
│       │   │   ├── reports/    # Task reports (photos, notes, submit)
│       │   │   └── ...         # devices, surveys, regions, etc.
│       │   ├── common/         # Shared guards, interceptors, decorators
│       │   ├── config/         # Configuration (DB, JWT, etc.)
│       │   ├── database/       # Migrations, seeds
│       │   └── main.ts
│       ├── nest-cli.json
│       └── package.json
│
├── packages/                   # Shared packages (monorepo)
│   └── shared/                 # Shared types, constants, utils (dùng chung Web & Mobile)
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
│   ├── Dockerfile.api
│   └── Dockerfile.mobile       # EAS build (optional)
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
| Frontend (Admin Web) | Next.js (App Router) | 15.x |
| Frontend (Mobile App) | React Native + Expo | RN 0.76.x / Expo SDK 52.x |
| Backend | NestJS | 10.x |
| Database | PostgreSQL | 16.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| State Management | Zustand | 4.x |
| UI Library (Web) | Tailwind CSS 3 | - |
| UI Library (Mobile) | React Native Paper / custom components | 5.x |
| Navigation (Mobile) | React Navigation | 7.x |
| Monorepo | Turborepo + pnpm workspace | - |
| Container | Docker + Docker Compose | - |
| Auth | JWT (access + refresh token) | - |
| Validation | class-validator (backend) + Zod (frontend/mobile) | - |
| Camera (Mobile) | expo-camera | ~16.x |
| Location (Mobile) | expo-location | ~17.x |
| Push Notifications | expo-notifications | - |
| Offline Storage (Mobile) | AsyncStorage + WatermelonDB / SQLite | - |

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

### Mobile App UI/UX (Field Staff)

#### Nguyên tắc thiết kế Mobile
- **Mobile-first**: giao diện tối ưu cho thao tác 1 tay, nút bấm kích thước tối thiểu 44x44pt
- **Offline-first**: hiển thị dữ liệu cache khi không có mạng, đồng bộ khi có kết nối trở lại
- **Performance**: ưu tiên tải nhanh, lazy load ảnh, giảm animation không cần thiết
- **Accessibility**: hỗ trợ font size lớn, contrast cao

#### Navigation Structure (Bottom Tab + Stack)
```
Bottom Tabs (5 tabs chính):
├── Home          # Trang chủ - tổng quan công việc hôm nay
├── Tasks         # Danh sách công việc được phân công
├── Check-in      # Check-in tại cửa hàng + GPS
├── Notifications # Thông báo & tin nhắn
└── Profile       # Thông tin cá nhân & cài đặt
```

#### Màn hình chính (Screens)

**1. Login Screen**
- Form đăng nhập: email/phone + password
- Hỗ trợ biometric (Face ID / fingerprint) sau lần đăng nhập đầu
- Logo + tên app

**2. Home Screen (Dashboard)**
- Card thống kê nhanh: số task hôm nay, đã hoàn thành, đang chờ, quá hạn
- Danh sách task gần nhất (upcoming / overdue)
- Quick action: Check-in nhanh, xem bản đồ cửa hàng

**3. Task List Screen**
- Tab filter: Tất cả | Hôm nay | Sắp tới | Hoàn thành
- Card task: tiêu đề, cửa hàng, thời gian, trạng thái (badge màu)
- Pull-to-refresh
- Search & filter theo trạng thái, loại công việc

**4. Task Detail Screen**
- Thông tin công việc: tiêu đề, mô tả, loại, template
- Thông tin cửa hàng: tên, địa chỉ, khoảng cách, nút mở Google Maps
- Checklist công việc (tick từng item)
- Chụp ảnh minh chứng (camera button, gallery picker)
- Viết báo cáo/ghi chú (text input)
- Nút Submit báo cáo

**5. Check-in Screen**
- Xác nhận vị trí GPS hiện tại
- Hiển thị khoảng cách đến cửa hàng
- Nút Check-in (chỉ hoạt động khi trong bán kính cho phép, vd 200m)
- Chụp ảnh check-in (bắt buộc)
- Xem lịch sử check-in

**6. Report Submission Screen**
- Form báo cáo: checklist items, text notes
- Upload ảnh minh chứng (chụp mới hoặc chọn từ gallery, tối đa 10 ảnh)
- Preview ảnh trước khi submit
- Nút Submit (offline: lưu local, tự đồng bộ khi có mạng)
- Trạng thái submit: Draft → Submitted → Synced

**7. Profile Screen**
- Thông tin cá nhân: avatar, tên, email, phone, role
- Cài đặt: ngôn ngữ, thông báo, theme
- Đổi mật khẩu
- Đăng xuất

#### Mobile Color Palette
- Giống web palette, thêm:
- **Tab Bar Background**: `#FFFFFF` với border top `#E5E7EB`
- **Tab Active**: `#2563EB` (primary blue)
- **Tab Inactive**: `#9CA3AF` (gray-400)
- **Card Shadow**: `rgba(0,0,0,0.08)` elevation 2
- **Status Bar**: light-content trên primary, dark-content trên background trắng

#### Mobile Components
- **TaskCard**: card hiển thị task gọn gàng, swipe để quick action
- **ChecklistItem**: checkbox + label + optional photo
- **PhotoCapture**: camera view + nút chụp + preview grid
- **LocationBanner**: hiển thị GPS status + khoảng cách đến cửa hàng
- **SyncIndicator**: icon đồng bộ (syncing / synced / offline)
- **StatusChip**: badge trạng thái task (màu theo trạng thái)

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

### 10. Mobile App - Field Staff (Nhân viên tiếp thị)

#### Mục đích
Ứng dụng mobile dành cho nhân viên tiếp thị (field staff / PG / promoter) làm việc tại cửa hàng/địa điểm thực tế. Nhân viên sử dụng app để:
- Xem công việc được phân công mỗi ngày
- Check-in tại cửa hàng bằng GPS
- Thực hiện checklist công việc
- Chụp ảnh minh chứng (trưng bày, sampling, thiết bị...)
- Viết báo cáo và submit kết quả
- Làm việc offline ở khu vực không có mạng

#### Kiến trúc Offline-First
- **AsyncStorage**: lưu token, user preferences, settings
- **SQLite / WatermelonDB**: lưu cache tasks, branches, templates locally
- **Queue-based sync**: thao tác offline (check-in, submit report) đưa vào queue, tự đồng bộ khi có mạng
- **Conflict resolution**: server-wins cho task updates, client-wins cho report drafts
- **Delta sync**: chỉ đồng bộ thay đổi kể từ lần sync cuối (timestamp-based)

#### Luồng hoạt động chính (User Flow)
```
Login → Home (xem task hôm nay)
  → Chọn Task → Xem chi tiết + thông tin cửa hàng
    → Đi đến cửa hàng → Check-in GPS (xác nhận vị trí)
      → Thực hiện checklist → Chụp ảnh minh chứng
        → Viết ghi chú/báo cáo → Submit
          → (Offline: lưu local → tự sync khi có mạng)
```

#### Tích hợp thiết bị (Device Capabilities)
- **Camera**: chụp ảnh minh chứng qua `expo-camera`, hỗ trợ flash, front/rear camera
- **GPS/Location**: tracking vị trí qua `expo-location`, tính khoảng cách đến cửa hàng
- **Push Notifications**: nhận thông báo task mới, nhắc nhở, qua `expo-notifications`
- **Biometric**: đăng nhập nhanh bằng Face ID / fingerprint qua `expo-local-authentication`
- **Gallery**: chọn ảnh từ thư viện qua `expo-image-picker`
- **Deep Linking**: mở app từ link task trực tiếp

#### API Endpoints bổ sung cho Mobile
```
GET    /api/v1/me/tasks              # Danh sách task của user hiện tại
GET    /api/v1/me/tasks/:id          # Chi tiết task (bao gồm checklist, template)
POST   /api/v1/me/check-in           # Check-in tại cửa hàng (GPS coords + photo)
GET    /api/v1/me/check-ins          # Lịch sử check-in
POST   /api/v1/me/reports            # Submit báo cáo (checklist + photos + notes)
POST   /api/v1/me/reports/:id/photos # Upload ảnh minh chứng (multipart)
GET    /api/v1/me/branches/nearby    # Cửa hàng gần đây (lat, lng, radius)
GET    /api/v1/me/sync               # Delta sync (last_sync_timestamp)
POST   /api/v1/me/device-token       # Đăng ký push notification token
```

#### Xử lý Upload Ảnh Mobile
- Nén ảnh trước khi upload: tối đa 1920px chiều dài, quality 80%
- Upload song song nhiều ảnh, hiển thị progress từng ảnh
- Retry tự động khi upload thất bại (exponential backoff)
- Ảnh offline lưu local, upload khi có kết nối mạng
- Format: JPEG, tối đa 5MB/ảnh sau khi nén


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

### Mobile Conventions (React Native + Expo)

#### Cấu trúc Screens
```
src/screens/
├── auth/                  # Login, ForgotPassword
│   ├── LoginScreen.tsx
│   └── ForgotPasswordScreen.tsx
├── home/                  # Dashboard, Task overview
│   └── HomeScreen.tsx
├── tasks/                 # Task list, detail, report
│   ├── TaskListScreen.tsx
│   ├── TaskDetailScreen.tsx
│   └── ReportSubmitScreen.tsx
├── checkin/               # Check-in flow
│   ├── CheckInScreen.tsx
│   └── CheckInHistoryScreen.tsx
├── notifications/         # Notifications list
│   └── NotificationsScreen.tsx
└── profile/               # Profile & settings
    ├── ProfileScreen.tsx
    └── SettingsScreen.tsx
```

#### Naming Conventions (Mobile)
- **Screens**: PascalCase với suffix `Screen` (`TaskListScreen.tsx`, `CheckInScreen.tsx`)
- **Components**: PascalCase (`TaskCard.tsx`, `PhotoCapture.tsx`)
- **Hooks**: camelCase prefix `use` (`useTasks`, `useLocation`, `useCamera`, `useSync`)
- **Services**: camelCase suffix `Service` (`apiService`, `storageService`, `syncService`)
- **Stores**: camelCase suffix `Store` (`authStore`, `taskStore`, `syncStore`)

#### State Management (Mobile)
- **Zustand** cho state global: auth, tasks cache, sync status
- **React Query / TanStack Query** cho API data: fetching, caching, background refresh
- **AsyncStorage** cho persistent data: tokens, user preferences
- **SQLite / WatermelonDB** cho offline data: tasks, branches, reports queue

#### Navigation
- React Navigation v7 với typed routes
- Bottom Tab Navigator cho 5 tabs chính
- Stack Navigator cho flow trong từng tab
- Deep linking config cho mở app từ notification/link

#### Code Style (Mobile)
- Functional components với arrow functions
- TypeScript strict mode, không dùng `any`
- Styles: StyleSheet.create (không dùng inline styles)
- Reuse `@fieldapp/shared` cho types, constants, utils chung với web
- Error boundaries cho mỗi screen
- React.memo cho components render thường xuyên (list items)

## Lệnh thường dùng

```bash
# Development
pnpm install                      # Cài đặt dependencies (root)
pnpm dev                          # Chạy tất cả services (turborepo)
pnpm dev:web                      # Chỉ chạy frontend web (Next.js)
pnpm dev:api                      # Chỉ chạy backend (NestJS)
pnpm dev:mobile                   # Chỉ chạy mobile app (Expo)

# Mobile (Expo)
cd apps/mobile
npx expo start                    # Khởi động Expo dev server
npx expo start --android          # Chạy trên Android emulator/device
npx expo start --ios              # Chạy trên iOS simulator/device
npx expo start --clear            # Clear cache và restart
npx expo install <package>        # Install Expo-compatible package

# Mobile Build (EAS - Expo Application Services)
eas build --platform android      # Build Android APK/AAB
eas build --platform ios          # Build iOS IPA
eas build --platform all          # Build cả 2 nền tảng
eas build --profile development   # Build development client
eas submit --platform android     # Submit lên Google Play
eas submit --platform ios         # Submit lên App Store
eas update                        # Push OTA update (không cần rebuild)

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
pnpm test:web                     # Test frontend web
pnpm test:api                     # Test backend
pnpm test:mobile                  # Test mobile app (Jest + React Native Testing Library)
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

# App (Web)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
PORT=3001

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Mobile App
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1    # API base URL cho mobile
EXPO_PUBLIC_APP_NAME=FieldApp Staff
EXPO_PUBLIC_DEFAULT_LANGUAGE=vi
EXPO_PUBLIC_CHECKIN_RADIUS=200                       # Bán kính check-in (meters)
EXPO_PUBLIC_MAX_PHOTOS_PER_REPORT=10
EXPO_PUBLIC_PHOTO_MAX_SIZE=5242880                   # 5MB sau nén
EXPO_PUBLIC_PHOTO_QUALITY=0.8                        # JPEG quality (0-1)
EXPO_PUBLIC_SYNC_INTERVAL=300                        # Đồng bộ mỗi 5 phút (seconds)
EXPO_PUBLIC_OFFLINE_QUEUE_LIMIT=100

# Push Notifications (Expo)
EXPO_PUSH_NOTIFICATION_KEY=your-expo-push-key

# EAS Build
EAS_PROJECT_ID=your-eas-project-id
```

## Ghi chú quan trọng

- Hệ thống hỗ trợ đa ngôn ngữ (Vietnamese mặc định, English)
- Mọi API endpoint đều yêu cầu authentication trừ `/auth/login`, `/auth/refresh`
- Upload ảnh cho báo cáo công việc: tối đa 10MB (web), 5MB sau nén (mobile), accept jpg/png/webp
- Timezone mặc định: Asia/Ho_Chi_Minh (UTC+7)
- Ngày tháng hiển thị theo format DD/MM/YYYY, thời gian HH:mm:ss

### Mobile App Notes
- Mobile app dùng chung backend API với Web app, tất cả qua `/api/v1/`
- Mobile app reuse `@fieldapp/shared` package cho types, constants, utils
- Field staff chỉ xem và thực hiện task được phân công cho mình (role: Staff, Team Leader)
- Check-in GPS yêu cầu nhân viên trong bán kính cửa hàng (mặc định 200m)
- Offline mode: tất cả thao tác được lưu local, tự đồng bộ khi có mạng
- Push notification cho: task mới được phân công, nhắc nhở task sắp đến hạn, task bị reject
- Biometric login (Face ID / fingerprint) optional, tự động bật sau lần đăng nhập đầu
- Hỗ trợ cả iOS 14+ và Android 8+ (API level 26+)
