import { PAGINATION_DEFAULTS } from '../constants';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
}

export function getPaginationParams(query: PaginationQuery) {
  const page = Number(query.page) || PAGINATION_DEFAULTS.PAGE;
  const limit = Math.min(
    Number(query.limit) || PAGINATION_DEFAULTS.LIMIT,
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
