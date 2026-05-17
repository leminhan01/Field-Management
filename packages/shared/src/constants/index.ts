export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Quản lý',
  TEAM_LEADER: 'Trưởng nhóm',
  STAFF: 'Nhân viên',
} as const;

export const BRANCH_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Trụ sở chính',
  SUPERMARKET: 'Chi nhánh miền Bắc',
  CONVENIENCE_STORE: 'Chi nhánh miền Trung',
  PHARMACY: 'Chi nhánh miền Nam',
  OTHER: 'Văn phòng đại diện',
} as const;

export const OUTLET_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Nha hang',
  SUPERMARKET: 'Sieu thi',
  CONVENIENCE_STORE: 'Cua hang tien loi',
  PHARMACY: 'Nha thuoc',
  OTHER: 'Khac',
} as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
} as const;

export const TASK_TYPE_LABELS: Record<string, string> = {
  REGULAR: 'Công việc định kỳ',
  DEVICE_CHECK: 'Kiểm tra thiết bị',
  SURVEY: 'Khảo sát',
  PROMOTION: 'Khuyến mãi',
} as const;

export const DEVICE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  MAINTENANCE: 'Bảo trì',
  BROKEN: 'Hỏng',
} as const;

export const TASK_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9CA3AF',
  ASSIGNED: '#2563EB',
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#10B981',
  APPROVED: '#059669',
  REJECTED: '#EF4444',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động',
  inactive: 'Ngừng hoạt động',
} as const;
