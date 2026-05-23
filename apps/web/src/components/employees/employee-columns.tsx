'use client';

import { Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/shared/status-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import type { Column } from '@/components/shared/data-table';
import type { EmployeeDto } from '@fieldapp/shared';

export interface EmployeeActions {
  onEdit: (employee: EmployeeDto) => void;
  onView: (employee: EmployeeDto) => void;
  onDelete: (employee: EmployeeDto) => void;
}

export function getEmployeeColumns(actions: EmployeeActions): Column<EmployeeDto>[] {
  return [
    {
      key: 'name',
      header: 'Employee',
      render: (e) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8" style={!e.avatar ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : undefined}>
            {e.avatar && <AvatarImage src={e.avatar} alt={e.name} />}
            <AvatarFallback className={`${e.avatar ? '' : 'bg-transparent'} text-white text-[12px] font-bold`}>
              {e.name.split(' ').map((n) => n[0]).join('').slice(-2)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold">{e.name}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (e) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Mail className="w-3 h-3" />{e.email}
          </div>
          {e.phone && (
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Phone className="w-3 h-3" />{e.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (e) => <RoleBadge role={e.role.replace(/_/g, ' ')} />,
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (e) => <span className="text-muted-foreground">{e.branch?.name || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <StatusBadge status={e.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'createdAt',
      header: 'Created date',
      render: (e) => (
        <span className="font-mono text-muted-foreground">
          {new Date(e.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (e) => {
        const items: ActionItem[] = [
          { label: 'Edit', onClick: () => actions.onEdit(e) },
          { label: 'View details', onClick: () => actions.onView(e) },
          { label: 'Delete', onClick: () => actions.onDelete(e), variant: 'destructive' },
        ];
        return <ActionMenu actions={items} />;
      },
    },
  ];
}
