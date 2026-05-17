'use client';

import { useState, useEffect } from 'react';
import { Camera, Clock, Download, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';

interface DeviceTask {
  id: number;
  branch: string;
  task: string;
  device: string;
  deviceType: string;
  startTime: string;
  endTime: string;
  status: string;
  assignee: string;
  [key: string]: unknown;
}

const mockData: DeviceTask[] = [
  { id: 1, branch: 'Restaurant B', task: 'Check Device', device: 'Camera B', deviceType: 'camera', startTime: '07:00:00', endTime: '20:00:00', status: 'Active', assignee: 'Nguyen Van A' },
  { id: 2, branch: 'Restaurant B', task: 'Check Device', device: 'Camera B', deviceType: 'camera', startTime: '09:48:00', endTime: '17:00:00', status: 'Active', assignee: 'Tran Thi B' },
  { id: 3, branch: 'Restaurant C', task: 'Maintenance POS', device: 'POS Machine #3', deviceType: 'pos', startTime: '08:00:00', endTime: '18:00:00', status: 'Pending', assignee: 'Le Minh C' },
  { id: 4, branch: 'AEON Binh Tan', task: 'Check Device', device: 'Camera A1', deviceType: 'camera', startTime: '09:00:00', endTime: '21:00:00', status: 'Active', assignee: 'Pham Thi D' },
  { id: 5, branch: 'Lotte Mart Q7', task: 'Replace Screen', device: 'Digital Signage #2', deviceType: 'screen', startTime: '10:00:00', endTime: '16:00:00', status: 'Completed', assignee: 'Hoang Van E' },
  { id: 6, branch: 'Coopmart Tan Dinh', task: 'Check Device', device: 'Camera C', deviceType: 'camera', startTime: '07:30:00', endTime: '19:30:00', status: 'Active', assignee: 'Nguyen Van A' },
  { id: 7, branch: 'WinMart Q1', task: 'Setup Standee', device: 'Standee #5', deviceType: 'standee', startTime: '08:00:00', endTime: '17:00:00', status: 'Pending', assignee: 'Tran Thi B' },
  { id: 8, branch: 'GO! Big C', task: 'Check Device', device: 'Camera D', deviceType: 'camera', startTime: '09:00:00', endTime: '20:00:00', status: 'Overdue', assignee: 'Le Minh C' },
  { id: 9, branch: 'Restaurant A', task: 'Install Camera', device: 'Camera E (new)', deviceType: 'camera', startTime: '14:00:00', endTime: '17:00:00', status: 'Pending', assignee: 'Pham Thi D' },
  { id: 10, branch: 'Restaurant B', task: 'Check Device', device: 'Camera B', deviceType: 'camera', startTime: '07:00:00', endTime: '20:00:00', status: 'Active', assignee: 'Hoang Van E' },
];

const PAGE_SIZE = 8;

export default function DeviceTaskPage() {
  const [data, setData] = useState<DeviceTask[]>(mockData);
  const [filteredData, setFilteredData] = useState<DeviceTask[]>(mockData);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.branch.toLowerCase().includes(q) || r.task.toLowerCase().includes(q) || r.device.toLowerCase().includes(q) || r.assignee.toLowerCase().includes(q),
      );
    }
    if (sortCol) {
      result.sort((a, b) => {
        const av = (a as unknown as Record<string, string>)[sortCol];
        const bv = (b as unknown as Record<string, string>)[sortCol];
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    setFilteredData(result);
    setPage(1);
  }, [search, data, sortCol, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setData(mockData); setSearch(''); setRefreshing(false); }, 800);
  };

  const handleDelete = (id: number) => {
    setData(data.filter((r) => r.id !== id));
  };

  const actions: ActionItem[] = [
    { label: 'Edit', onClick: () => {} },
    { label: 'View Detail', onClick: () => {} },
    { label: 'Delete', onClick: () => handleDelete(0), variant: 'destructive' },
  ];

  const SortHeader = ({ col, label }: { col: string; label: string }) => (
    <button
      className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground select-none"
      onClick={() => handleSort(col)}
    >
      {label}
      <motion.span
        animate={{ rotate: sortCol === col ? (sortAsc ? 0 : 180) : 0 }}
        transition={{ duration: 0.15 }}
        className="opacity-50 text-[10px]"
      >
        ⇅
      </motion.span>
    </button>
  );

  const columns: Column<DeviceTask>[] = [
    { key: 'branch', header: 'Branch', headClassName: 'pl-4', render: (r) => (
      <span className="font-semibold">{r.branch}</span>
    )},
    { key: 'task', header: 'Task', render: (r) => <span>{r.task}</span> },
    { key: 'device', header: 'Devices', render: (r) => (
      <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[12px] font-semibold font-mono">
        <Camera className="w-3.5 h-3.5" />{r.device}
      </span>
    )},
    { key: 'startTime', header: 'Start Time', render: (r) => (
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[13px]">
        <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />{r.startTime}
      </div>
    )},
    { key: 'endTime', header: 'End Time', render: (r) => (
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[13px]">
        <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />{r.endTime}
      </div>
    )},
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', className: 'w-10', render: (r) => (
      <ActionMenu actions={[
        { label: 'Edit', onClick: () => {} },
        { label: 'View Detail', onClick: () => {} },
        { label: 'Delete', onClick: () => handleDelete(r.id), variant: 'destructive' },
      ]} />
    )},
  ];

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search..."
        searchValue={search}
        onSearchChange={setSearch}
        primaryAction={{ label: 'Assign', onClick: () => {} }}
        secondaryActions={
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Download className="w-3.5 h-3.5" />Export</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]" onClick={handleRefresh}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Filter className="w-3.5 h-3.5" />Filter</Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={pageData}
        selectable
        selectedIds={selectedRows}
        onSelectChange={setSelectedRows}
        getRowId={(r) => String(r.id)}
        emptyMessage="No device tasks found."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageWrapper>
  );
}
