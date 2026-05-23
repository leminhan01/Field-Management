// Material Design 3 color system - matching mockup HTML palette
export const COLORS = {
  primary: '#000666',
  primaryContainer: '#1a237e',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#8690ee',
  secondary: '#006e1c',
  secondaryContainer: '#91f78e',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#00731e',
  background: '#f7f9fc',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainer: '#eceef1',
  surfaceContainerHigh: '#e6e8eb',
  surfaceVariant: '#e0e3e6',
  onSurface: '#191c1e',
  onSurfaceVariant: '#454652',
  outline: '#767683',
  outlineVariant: '#c6c5d4',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  success: '#4CAF50',
  warning: '#F59E0B',
  submitGreen: '#4CAF50',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#e0e3e6', text: '#454652' },
  ASSIGNED: { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#dcfce7', text: '#006e1c' },
  COMPLETED: { bg: '#dcfce7', text: '#10B981' },
  APPROVED: { bg: '#dcfce7', text: '#10B981' },
  REJECTED: { bg: '#ffdad6', text: '#ba1a1a' },
  DRAFT: { bg: '#e0e3e6', text: '#6B7280' },
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chưa bắt đầu',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  DRAFT: 'Nháp',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
