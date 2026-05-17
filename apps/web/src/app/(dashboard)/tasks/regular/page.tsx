'use client';

import { useState } from 'react';
import { MapPin, User, Clock, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';

interface RegularTask {
  id: number;
  title: string;
  type: string;
  branch: string;
  assignee: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  [key: string]: unknown;
}

const mockTasks: RegularTask[] = [
  { id: 1, title: 'Kiem tra trung bay BB', type: 'BB', branch: 'Lotte Mart Q7', assignee: 'Nguyen Van An', scheduledDate: '14/05/2026', startTime: '08:00', endTime: '10:00', status: 'In Progress' },
  { id: 2, title: 'Sampling san pham moi', type: 'BG', branch: 'Coopmart Tan Dinh', assignee: 'Tran Thi Bich', scheduledDate: '14/05/2026', startTime: '09:00', endTime: '12:00', status: 'Assigned' },
  { id: 3, title: 'Bao cao trung bay thang 5', type: 'BB', branch: 'AEON Binh Tan', assignee: 'Le Minh Chau', scheduledDate: '15/05/2026', startTime: '14:00', endTime: '16:00', status: 'Draft' },
  { id: 4, title: 'Quang ba san pham moi', type: 'Promotion', branch: 'WinMart Q1', assignee: 'Pham Thi Dung', scheduledDate: '15/05/2026', startTime: '10:00', endTime: '17:00', status: 'Completed' },
  { id: 5, title: 'Cham soc khach hang VIP', type: 'BG', branch: 'GO! Big C', assignee: 'Hoang Van Em', scheduledDate: '16/05/2026', startTime: '08:00', endTime: '11:00', status: 'Assigned' },
  { id: 6, title: 'Kiem tra POS trung bay', type: 'BB', branch: 'Outlet A', assignee: 'Vo Thi Phuong', scheduledDate: '16/05/2026', startTime: '13:00', endTime: '15:00', status: 'Draft' },
];

const taskTypeColors: Record<string, string> = {
  BB: 'bg-orange-50 text-orange-700 border-orange-200',
  BG: 'bg-teal-50 text-teal-700 border-teal-200',
  Promotion: 'bg-pink-50 text-pink-700 border-pink-200',
};

function TaskTypeBadge({ type }: { type: string }) {
  const color = taskTypeColors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${color}`}>{type}</span>;
}

const PAGE_SIZE = 8;

export default function RegularTaskPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = mockTasks.filter((t) => {
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.branch.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const actions: ActionItem[] = [
    { label: 'Edit', onClick: () => {} },
    { label: 'View', onClick: () => {} },
    { label: 'Delete', onClick: () => {}, variant: 'destructive' },
  ];

  const columns: Column<RegularTask>[] = [
    { key: 'title', header: 'Task Name', render: (t) => <span className="font-semibold">{t.title}</span> },
    { key: 'type', header: 'Type', render: (t) => <TaskTypeBadge type={t.type} /> },
    { key: 'branch', header: 'Branch', render: (t) => <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{t.branch}</span> },
    { key: 'assignee', header: 'Assignee', render: (t) => <span className="flex items-center gap-1 text-muted-foreground"><User className="w-3.5 h-3.5" />{t.assignee}</span> },
    { key: 'schedule', header: 'Schedule', render: (t) => (
      <div className="space-y-0.5">
        <span className="block text-[13px] text-muted-foreground">{t.scheduledDate}</span>
        <span className="block text-[11px] text-muted-foreground/70 font-mono">{t.startTime} - {t.endTime}</span>
      </div>
    )},
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'actions', header: '', className: 'w-10', render: () => <ActionMenu actions={actions} /> },
  ];

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search tasks..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        primaryAction={{ label: 'Create Task', onClick: () => {} }}
        secondaryActions={
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]" onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Filter className="w-3.5 h-3.5" />Filter</Button>
          </>
        }
      />
      <DataTable columns={columns} data={pageData} selectable getRowId={(r) => String(r.id)} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageWrapper>
  );
}
