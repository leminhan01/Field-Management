'use client';

import { useState } from 'react';
import { MapPin, Store, Download, Upload, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';

interface Branch {
  id: number;
  name: string;
  type: string;
  region: string;
  address: string;
  phone: string;
  manager: string;
  staffCount: number;
  status: string;
  [key: string]: unknown;
}

const mockBranches: Branch[] = [
  { id: 1, name: 'Lotte Mart Q7', type: 'Supermarket', region: 'HCM - Quan 7', address: '300 Nguyen Van Linh, Q7', phone: '028 1234 567', manager: 'Pham Thi Dung', staffCount: 8, status: 'Active' },
  { id: 2, name: 'Coopmart Tan Dinh', type: 'Supermarket', region: 'HCM - Quan 1', address: '269 Nguyen Dinh Chieu, Q1', phone: '028 2345 678', manager: 'Tran Thi Bich', staffCount: 6, status: 'Active' },
  { id: 3, name: 'AEON Binh Tan', type: 'Mall', region: 'HCM - Binh Tan', address: '01 Duong so 17, Binh Tan', phone: '028 3456 789', manager: 'Le Minh Chau', staffCount: 12, status: 'Active' },
  { id: 4, name: 'WinMart Q1', type: 'Supermarket', region: 'HCM - Quan 1', address: '45 Nguyen Trai, Q1', phone: '028 4567 890', manager: 'Nguyen Van An', staffCount: 5, status: 'Active' },
  { id: 5, name: 'GO! Big C Dong Nai', type: 'Hypermarket', region: 'Dong Nai', address: '123 Dong Khoi, Bien Hoa', phone: '0251 567 890', manager: 'Hoang Van Em', staffCount: 10, status: 'Active' },
  { id: 6, name: 'Restaurant A', type: 'Restaurant', region: 'HCM - Quan 3', address: '78 Vo Van Tan, Q3', phone: '028 6789 012', manager: 'Vo Thi Phuong', staffCount: 4, status: 'Active' },
  { id: 7, name: 'Restaurant B', type: 'Restaurant', region: 'HCM - Phu Nhuan', address: '56 Phan Xich Long, PN', phone: '028 7890 123', manager: 'Dang Minh Quang', staffCount: 4, status: 'Active' },
  { id: 8, name: 'Restaurant C', type: 'Restaurant', region: 'HCM - Binh Thanh', address: '90 Le Van Sy, BT', phone: '028 8901 234', manager: 'Bui Thi Hoa', staffCount: 3, status: 'Inactive' },
];

const PAGE_SIZE = 8;

const branchTypeColors: Record<string, string> = {
  Supermarket: 'bg-blue-50 text-blue-700 border-blue-200',
  Mall: 'bg-purple-50 text-purple-700 border-purple-200',
  Hypermarket: 'bg-amber-50 text-amber-700 border-amber-200',
  Restaurant: 'bg-orange-50 text-orange-700 border-orange-200',
};

function BranchTypeBadge({ type }: { type: string }) {
  const color = branchTypeColors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${color}`}>{type}</span>;
}

export default function BranchesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockBranches.filter((b) => {
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.region.toLowerCase().includes(q) || b.type.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const actions: ActionItem[] = [
    { label: 'Edit', onClick: () => {} },
    { label: 'View Detail', onClick: () => {} },
    { label: 'Delete', onClick: () => {}, variant: 'destructive' },
  ];

  const columns: Column<Branch>[] = [
    { key: 'name', header: 'Branch Name', render: (b) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Store className="w-4 h-4" />
        </div>
        <span className="font-semibold">{b.name}</span>
      </div>
    )},
    { key: 'type', header: 'Type', render: (b) => <BranchTypeBadge type={b.type} /> },
    { key: 'region', header: 'Region', render: (b) => <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{b.region}</span> },
    { key: 'address', header: 'Address', className: 'max-w-[200px]', render: (b) => <span className="text-muted-foreground truncate block">{b.address}</span> },
    { key: 'manager', header: 'Manager', render: (b) => <span className="text-muted-foreground">{b.manager}</span> },
    { key: 'staffCount', header: 'Staff', render: (b) => (
      <Avatar className="w-7 h-7">
        <AvatarFallback className="bg-muted text-[12px] font-semibold">{b.staffCount}</AvatarFallback>
      </Avatar>
    )},
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'actions', header: '', className: 'w-10', render: () => <ActionMenu actions={actions} /> },
  ];

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search branches..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        primaryAction={{ label: 'Add Branch', onClick: () => {} }}
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
