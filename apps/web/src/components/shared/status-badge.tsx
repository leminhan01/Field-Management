import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyleMap: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'in progress': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  assigned: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  maintenance: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  broken: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  open: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyleMap[status.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold w-fit',
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
      {status}
    </span>
  );
}

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const roleStyleMap: Record<string, { bg: string; text: string }> = {
  'super admin': { bg: 'bg-purple-50', text: 'text-purple-700' },
  admin: { bg: 'bg-red-50', text: 'text-red-700' },
  manager: { bg: 'bg-blue-50', text: 'text-blue-700' },
  'team leader': { bg: 'bg-amber-50', text: 'text-amber-700' },
  staff: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const style = roleStyleMap[role.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold',
        style.bg,
        style.text,
        className,
      )}
    >
      {role}
    </span>
  );
}

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#e8edfb] text-[#0052cc]',
        className,
      )}
    >
      {type}
    </span>
  );
}
