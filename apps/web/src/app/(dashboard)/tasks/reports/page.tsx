'use client';

import { useState } from 'react';
import { Download, Filter, Image, User, MapPin, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';

interface Report {
  id: number;
  taskName: string;
  assignee: string;
  branch: string;
  submittedAt: string;
  photos: number;
  status: string;
  notes: string;
  [key: string]: unknown;
}

const mockReports: Report[] = [
  { id: 1, taskName: 'BB display inspection', assignee: 'Nguyen Van An', branch: 'Lotte Mart Q7', submittedAt: '14/05/2026 10:30', photos: 4, status: 'Approved', notes: 'Display meets standards' },
  { id: 2, taskName: 'New product sampling', assignee: 'Tran Thi Bich', branch: 'Coopmart Tan Dinh', submittedAt: '14/05/2026 12:15', photos: 6, status: 'Pending', notes: 'Pending approval' },
  { id: 3, taskName: 'Camera inspection', assignee: 'Le Minh Chau', branch: 'AEON Binh Tan', submittedAt: '13/05/2026 18:00', photos: 2, status: 'Approved', notes: 'Camera is working normally' },
  { id: 4, taskName: 'May BG report', assignee: 'Pham Thi Dung', branch: 'WinMart Q1', submittedAt: '12/05/2026 16:45', photos: 3, status: 'Rejected', notes: 'Missing photos' },
  { id: 5, taskName: 'Setup standee', assignee: 'Hoang Van Em', branch: 'GO! Big C', submittedAt: '11/05/2026 11:20', photos: 5, status: 'Approved', notes: 'Completed on time' },
  { id: 6, taskName: 'BB display inspection', assignee: 'Vo Thi Phuong', branch: 'Outlet A', submittedAt: '10/05/2026 09:30', photos: 3, status: 'Pending', notes: 'Reports cho duyet' },
];

const PAGE_SIZE = 8;

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockReports.filter((r) => {
    const q = search.toLowerCase();
    return r.taskName.toLowerCase().includes(q) || r.assignee.toLowerCase().includes(q) || r.branch.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const actions: ActionItem[] = [
    { label: 'View Detail', onClick: () => {}, icon: <Eye className="w-4 h-4" /> },
  ];

  const columns: Column<Report>[] = [
    { key: 'taskName', header: 'Task', render: (r) => (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="font-semibold">{r.taskName}</span>
      </div>
    )},
    { key: 'assignee', header: 'Assignee', render: (r) => <span className="flex items-center gap-1 text-muted-foreground"><User className="w-3.5 h-3.5" />{r.assignee}</span> },
    { key: 'branch', header: 'Branch', render: (r) => <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{r.branch}</span> },
    { key: 'submittedAt', header: 'Submitted', render: (r) => <span className="font-mono text-muted-foreground">{r.submittedAt}</span> },
    { key: 'photos', header: 'Photos', render: (r) => <span className="flex items-center gap-1 text-muted-foreground"><Image className="w-3.5 h-3.5" />{r.photos}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', className: 'w-10', render: () => <ActionMenu actions={actions} /> },
  ];

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search reports..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        secondaryActions={
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Download className="w-3.5 h-3.5" />Export</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Filter className="w-3.5 h-3.5" />Filter</Button>
          </>
        }
      />
      <DataTable columns={columns} data={pageData} selectable getRowId={(r) => String(r.id)} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageWrapper>
  );
}
