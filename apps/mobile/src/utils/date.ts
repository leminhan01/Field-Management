import dayjs from 'dayjs';

export function formatDate(date: string | null | Date): string {
  if (!date) return '--';
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateTime(date: string | null | Date): string {
  if (!date) return '--';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function formatTime(date: string | null | Date): string {
  if (!date) return '--';
  return dayjs(date).format('HH:mm');
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isOverdue(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

export function getRelativeTime(date: string | Date): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = target.diff(now, 'day');

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  if (diffDays === -1) return 'Hôm qua';
  if (diffDays > 0) return `${diffDays} ngày nữa`;
  return `${Math.abs(diffDays)} ngày trước`;
}
