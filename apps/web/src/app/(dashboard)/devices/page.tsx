'use client';

import { useState } from 'react';
import { Camera, Monitor, Tv, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';

interface Device {
  id: number;
  name: string;
  serial: string;
  type: string;
  branch: string;
  status: string;
  lastChecked: string;
  assignedTask: string;
  [key: string]: unknown;
}

const mockDevices: Device[] = [
  { id: 1, name: 'Camera A1', serial: 'CAM-001-AE', type: 'Camera', branch: 'AEON Binh Tan', status: 'Active', lastChecked: '14/05/2026', assignedTask: 'Check Device' },
  { id: 2, name: 'Camera B', serial: 'CAM-002-RB', type: 'Camera', branch: 'Outlet B', status: 'Active', lastChecked: '14/05/2026', assignedTask: 'Check Device' },
  { id: 3, name: 'POS Machine #3', serial: 'POS-003-RB', type: 'POS', branch: 'Outlet B', status: 'Maintenance', lastChecked: '10/05/2026', assignedTask: 'Maintenance POS' },
  { id: 4, name: 'Digital Signage #2', serial: 'DSG-002-LM', type: 'Screen', branch: 'Lotte Mart Q7', status: 'Active', lastChecked: '13/05/2026', assignedTask: 'Replace Screen' },
  { id: 5, name: 'Standee #5', serial: 'STD-005-WM', type: 'Standee', branch: 'WinMart Q1', status: 'Active', lastChecked: '12/05/2026', assignedTask: 'Setup Standee' },
  { id: 6, name: 'Camera C', serial: 'CAM-003-CT', type: 'Camera', branch: 'Coopmart Tan Dinh', status: 'Broken', lastChecked: '08/05/2026', assignedTask: '-' },
  { id: 7, name: 'Camera D', serial: 'CAM-004-GB', type: 'Camera', branch: 'GO! Big C', status: 'Active', lastChecked: '14/05/2026', assignedTask: 'Check Device' },
  { id: 8, name: 'Camera E (new)', serial: 'CAM-005-RA', type: 'Camera', branch: 'Outlet A', status: 'Pending', lastChecked: '-', assignedTask: 'Install Camera' },
];

const typeIcons: Record<string, typeof Camera> = { Camera, POS: Monitor, Screen: Tv, Standee: Monitor };
const PAGE_SIZE = 8;

export default function DevicesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockDevices.filter((d) => {
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.serial.toLowerCase().includes(q) || d.branch.toLowerCase().includes(q) || d.type.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const actions: ActionItem[] = [
    { label: 'Edit', onClick: () => {} },
    { label: 'View Detail', onClick: () => {} },
    { label: 'Delete', onClick: () => {}, variant: 'destructive' },
  ];

  const columns: Column<Device>[] = [
    { key: 'name', header: 'Device', render: (d) => {
      const Icon = typeIcons[d.type] || Monitor;
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-4 h-4" /></div>
          <span className="font-semibold">{d.name}</span>
        </div>
      );
    }},
    { key: 'serial', header: 'Serial', render: (d) => <span className="font-mono text-muted-foreground">{d.serial}</span> },
    { key: 'type', header: 'Type', render: (d) => {
      const Icon = typeIcons[d.type] || Monitor;
      return <span className="inline-flex items-center gap-1 text-muted-foreground text-[12px]"><Icon className="w-3.5 h-3.5" />{d.type}</span>;
    }},
    { key: 'branch', header: 'Branch', render: (d) => <span className="text-muted-foreground">{d.branch}</span> },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    { key: 'lastChecked', header: 'Last Checked', render: (d) => <span className="font-mono text-muted-foreground">{d.lastChecked}</span> },
    { key: 'actions', header: '', className: 'w-10', render: () => <ActionMenu actions={actions} /> },
  ];

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search devices..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        primaryAction={{ label: 'Add Device', onClick: () => {} }}
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
