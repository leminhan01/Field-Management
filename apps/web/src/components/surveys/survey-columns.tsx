'use client';

import { ClipboardList, BarChart3, User } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import type { Column } from '@/components/shared/data-table';
import type { SurveyDto } from '@fieldapp/shared';

export interface SurveyActions {
  onEdit: (survey: SurveyDto) => void;
  onView: (survey: SurveyDto) => void;
  onDelete: (survey: SurveyDto) => void;
  onStatusChange: (survey: SurveyDto, newStatus: string) => void;
}

export function getSurveyColumns(actions: SurveyActions): Column<SurveyDto>[] {
  return [
    {
      key: 'title',
      header: 'Survey',
      render: (s) => (
        <div>
          <span className="font-semibold text-[13px]">{s.title}</span>
          {s.description && (
            <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
              {s.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'questions',
      header: 'Questions',
      render: (s) => (
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <ClipboardList className="w-3.5 h-3.5" />
          {Array.isArray(s.questions) ? s.questions.length : 0}
        </span>
      ),
    },
    {
      key: 'responses',
      header: 'Responses',
      render: (s) => (
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <BarChart3 className="w-3.5 h-3.5" />
          {s._count?.responses ?? 0}
        </span>
      ),
    },
    {
      key: 'createdBy',
      header: 'Created by',
      render: (s) => (
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <User className="w-3 h-3" />
          {s.createdBy?.name || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created date',
      render: (s) => (
        <span className="font-mono text-[12px] text-muted-foreground">
          {new Date(s.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (s) => {
        const items: ActionItem[] = [];

        if (s.status === 'DRAFT' && (s._count?.responses ?? 0) === 0) {
          items.push({ label: 'Edit', onClick: () => actions.onEdit(s) });
        }

        items.push({ label: 'View details', onClick: () => actions.onView(s) });

        if (s.status === 'DRAFT') {
          items.push({
            label: 'Activate',
            onClick: () => actions.onStatusChange(s, 'ACTIVE'),
          });
        }

        if (s.status === 'ACTIVE') {
          items.push({
            label: 'Close',
            onClick: () => actions.onStatusChange(s, 'CLOSED'),
          });
        }

        if ((s._count?.responses ?? 0) === 0) {
          items.push({
            label: 'Delete',
            onClick: () => actions.onDelete(s),
            variant: 'destructive',
          });
        }

        return <ActionMenu actions={items} />;
      },
    },
  ];
}
