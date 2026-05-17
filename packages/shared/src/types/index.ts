// Enums

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEAM_LEADER = 'TEAM_LEADER',
  STAFF = 'STAFF',
}

export enum BranchType {
  RESTAURANT = 'RESTAURANT',
  SUPERMARKET = 'SUPERMARKET',
  CONVENIENCE_STORE = 'CONVENIENCE_STORE',
  PHARMACY = 'PHARMACY',
  OTHER = 'OTHER',
}

export enum TaskType {
  REGULAR = 'REGULAR',
  DEVICE_CHECK = 'DEVICE_CHECK',
  SURVEY = 'SURVEY',
  PROMOTION = 'PROMOTION',
}

export enum TaskStatus {
  DRAFT = 'DRAFT',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DeviceType {
  CAMERA = 'CAMERA',
  DISPLAY_SCREEN = 'DISPLAY_SCREEN',
  STANDEE = 'STANDEE',
  SHELF = 'SHELF',
  FRIDGE = 'FRIDGE',
  OTHER = 'OTHER',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  BROKEN = 'BROKEN',
}

export enum SurveyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

// ==================== Pagination & API ====================

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Employee ====================

export interface EmployeeDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  branchId: string | null;
  branch: { id: string; name: string; code: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EmployeeQueryParams extends PaginationQuery {
  search?: string;
  role?: string;
  branchId?: string;
  isActive?: string;
}

export interface CreateEmployeeInput {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: string;
  branchId?: string;
}

export interface UpdateEmployeeInput {
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  branchId?: string;
  isActive?: boolean;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

// ==================== Utility Functions ====================

export function getPaginationParams(query: PaginationQuery) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
