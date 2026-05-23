export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  TEAM_LEADER: 'Team Leader',
  STAFF: 'Staff',
} as const;

export const BRANCH_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Head Office',
  SUPERMARKET: 'Northern Branch',
  CONVENIENCE_STORE: 'Central Branch',
  PHARMACY: 'Southern Branch',
  OTHER: 'Representative Office',
} as const;

export const OUTLET_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurant',
  SUPERMARKET: 'Supermarket',
  CONVENIENCE_STORE: 'Convenience Store',
  PHARMACY: 'Pharmacy',
  OTHER: 'Other',
} as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export const TASK_TYPE_LABELS: Record<string, string> = {
  REGULAR: 'Regular Task',
  DEVICE_CHECK: 'Device Check',
  SURVEY: 'Survey',
  PROMOTION: 'Promotion',
} as const;

export const DEVICE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  MAINTENANCE: 'Maintenance',
  BROKEN: 'Broken',
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
  active: 'Active',
  inactive: 'Inactive',
} as const;
