'use client';

import { useState } from 'react';
import { Mail, Phone, Download, Upload, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge, RoleBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  status: string;
  joinDate: string;
  avatar?: string;
  [key: string]: unknown;
}

const mockEmployees: Employee[] = [
  { id: 1, name: 'Nguyen Van An', email: 'an.nguyen@field.com', phone: '0901 234 567', role: 'Team Leader', branch: 'Lotte Mart Q7', status: 'Active', joinDate: '15/01/2025' },
  { id: 2, name: 'Tran Thi Bich', email: 'bich.tran@field.com', phone: '0902 345 678', role: 'Staff', branch: 'Coopmart Tan Dinh', status: 'Active', joinDate: '03/03/2025' },
  { id: 3, name: 'Le Minh Chau', email: 'chau.le@field.com', phone: '0903 456 789', role: 'Staff', branch: 'AEON Binh Tan', status: 'Active', joinDate: '20/06/2025' },
  { id: 4, name: 'Pham Thi Dung', email: 'dung.pham@field.com', phone: '0904 567 890', role: 'Manager', branch: 'WinMart Q1', status: 'Active', joinDate: '10/02/2025' },
  { id: 5, name: 'Hoang Van Em', email: 'em.hoang@field.com', phone: '0905 678 901', role: 'Staff', branch: 'GO! Big C', status: 'Inactive', joinDate: '01/09/2024' },
  { id: 6, name: 'Vo Thi Phuong', email: 'phuong.vo@field.com', phone: '0906 789 012', role: 'Staff', branch: 'Restaurant A', status: 'Active', joinDate: '12/04/2025' },
  { id: 7, name: 'Dang Minh Quang', email: 'quang.dang@field.com', phone: '0907 890 123', role: 'Team Leader', branch: 'Restaurant B', status: 'Active', joinDate: '22/08/2024' },
  { id: 8, name: 'Bui Thi Hoa', email: 'hoa.bui@field.com', phone: '0908 901 234', role: 'Staff', branch: 'Restaurant C', status: 'On Leave', joinDate: '05/11/2024' },
];

const statusDotColors: Record<string, string> = {
  Active: 'bg-emerald-400', Inactive: 'bg-gray-400', 'On Leave': 'bg-amber-400',
};

const PAGE_SIZE = 8;

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockEmployees.filter((e) => {
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.branch.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const actions: ActionItem[] = [
    { label: 'Edit', onClick: () => {} },
    { label: 'View Detail', onClick: () => {} },
    { label: 'Delete', onClick: () => {}, variant: 'destructive' },
  ];

  const columns: Column<Employee>[] = [
    { key: 'name', header: 'Employee', render: (e) => (
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          <AvatarFallback className="bg-transparent text-white text-[12px] font-bold">
            {e.name.split(' ').map(n => n[0]).join('').slice(-2)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold">{e.name}</span>
      </div>
    )},
    { key: 'contact', header: 'Contact', render: (e) => (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Mail className="w-3 h-3" />{e.email}</div>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Phone className="w-3 h-3" />{e.phone}</div>
      </div>
    )},
    { key: 'role', header: 'Role', render: (e) => <RoleBadge role={e.role} /> },
    { key: 'branch', header: 'Branch', render: (e) => <span className="text-muted-foreground">{e.branch}</span> },
    { key: 'status', header: 'Status', render: (e) => (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <span className={`w-2 h-2 rounded-full ${statusDotColors[e.status] || 'bg-gray-400'}`} />
        {e.status}
      </span>
    )},
    { key: 'joinDate', header: 'Join Date', render: (e) => <span className="font-mono text-muted-foreground">{e.joinDate}</span> },
    { key: 'actions', header: '', className: 'w-10', render: () => <ActionMenu actions={actions} /> },
  ];

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search employees..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        primaryAction={{ label: 'Add Employee', onClick: () => {} }}
        secondaryActions={
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Upload className="w-3.5 h-3.5" />Import</Button>
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
