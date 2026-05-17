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

export enum OutletType {
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
  positionId: string | null;
  position: { id: string; name: string; code: string; permissions: string[] } | null;
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
  positionId?: string;
}

export interface UpdateEmployeeInput {
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  branchId?: string;
  positionId?: string;
  isActive?: boolean;
}

// ==================== Position ====================

export interface PermissionDto {
  key: string;
  label: string;
  group: string;
}

export interface PositionDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  role: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: { users: number };
}

export interface PositionQueryParams extends PaginationQuery {
  search?: string;
  isActive?: string;
}

export interface CreatePositionInput {
  name: string;
  code: string;
  description?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdatePositionInput {
  name?: string;
  code?: string;
  description?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

// ==================== Branch ====================

export interface BranchDto {
  id: string;
  name: string;
  code: string;
  address: string | null;
  type: string;
  regionId: string | null;
  region: { id: string; name: string; code: string } | null;
  managerId: string | null;
  manager: { id: string; name: string; email: string } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count: {
    employees: number;
    devices: number;
    tasks: number;
  };
}

export interface BranchOptionDto {
  id: string;
  name: string;
  code: string;
}

export interface BranchQueryParams extends PaginationQuery {
  search?: string;
  type?: string;
  regionId?: string;
  isActive?: string;
}

export interface CreateBranchInput {
  name: string;
  code: string;
  address?: string;
  type: string;
  regionId?: string;
  managerId?: string;
}

export interface UpdateBranchInput {
  name?: string;
  code?: string;
  address?: string;
  type?: string;
  regionId?: string;
  managerId?: string;
  isActive?: boolean;
}

// ==================== Outlet ====================

export interface OutletDto {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  type: string;
  brand: string | null;
  branchId: string;
  branch: { id: string; name: string; code: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OutletQueryParams extends PaginationQuery {
  search?: string;
  type?: string;
  branchId?: string;
  isActive?: string;
}

export interface CreateOutletInput {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  type?: string;
  brand?: string;
  branchId: string;
}

export interface UpdateOutletInput {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  type?: string;
  brand?: string;
  branchId?: string;
  isActive?: boolean;
}

// ==================== Task Template & Group ====================

export interface TaskTemplateDto {
  id: string;
  name: string;
  description: string | null;
  type: string;
  checklist: string[];
  photoRequired: boolean;
  estimatedDuration: number | null;
  isActive: boolean;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    tasks: number;
    groupItems: number;
  };
}

export interface TaskTemplateOptionDto {
  id: string;
  name: string;
  type: string;
  estimatedDuration: number | null;
}

export interface TaskTemplateQueryParams extends PaginationQuery {
  search?: string;
  type?: string;
  isActive?: string;
}

export interface CreateTaskTemplateInput {
  name: string;
  description?: string;
  type: string;
  checklist: string[];
  photoRequired?: boolean;
  estimatedDuration?: number;
}

export interface UpdateTaskTemplateInput {
  name?: string;
  description?: string;
  type?: string;
  checklist?: string[];
  photoRequired?: boolean;
  estimatedDuration?: number;
  isActive?: boolean;
}

export interface TaskGroupTemplateItemDto {
  id: string;
  sortOrder: number;
  template: {
    id: string;
    name: string;
    type: string;
    checklist: string[];
    photoRequired: boolean;
    estimatedDuration: number | null;
    isActive: boolean;
  };
}

export interface TaskGroupDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  templates: TaskGroupTemplateItemDto[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TaskGroupQueryParams extends PaginationQuery {
  search?: string;
  isActive?: string;
}

export interface CreateTaskGroupInput {
  name: string;
  code: string;
  description?: string;
  templateIds: string[];
}

export interface UpdateTaskGroupInput {
  name?: string;
  code?: string;
  description?: string;
  templateIds?: string[];
  isActive?: boolean;
}

export interface AssignTaskGroupInput {
  assigneeId: string;
  branchId: string;
  scheduledAt: string;
  titlePrefix?: string;
}

// ==================== Dashboard ====================

export interface DashboardSummaryDto {
  employees: {
    total: number;
    active: number;
    inactive: number;
  };
  branches: {
    total: number;
    active: number;
  };
  outlets: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    thisWeek: number;
  };
  devices: {
    total: number;
    active: number;
    issue: number;
  };
  surveys: {
    total: number;
    active: number;
  };
}

export interface DashboardStatusDto {
  status: string;
  count: number;
  percent: number;
}

export interface DashboardRecentTaskDto {
  id: string;
  title: string;
  type: string;
  branch: string;
  assignee: string | null;
  status: string;
  dueDate: string | null;
}

export interface DashboardAlertDto {
  key: string;
  title: string;
  description: string;
  count: number;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface DashboardModuleDto {
  key: string;
  label: string;
  href: string;
  count: string;
}

export interface DashboardOverviewDto {
  summary: DashboardSummaryDto;
  taskStatuses: DashboardStatusDto[];
  recentTasks: DashboardRecentTaskDto[];
  alerts: DashboardAlertDto[];
  modules: DashboardModuleDto[];
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
