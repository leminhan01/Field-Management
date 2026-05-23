'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, Filter, Loader2, MapPin, RefreshCw, Store, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS } from '@fieldapp/shared';
import type { TaskDto, TaskQueryParams } from '@fieldapp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActionMenu } from '@/components/shared/action-menu';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { useBranches } from '@/hooks/use-branches';
import { useEmployees } from '@/hooks/use-employees';
import { useOutlets } from '@/hooks/use-outlets';
import { useTasks } from '@/hooks/use-tasks';
import { deleteTask, extractTaskErrorMessage } from '@/lib/tasks';

const TASK_TYPES = ['REGULAR', 'DEVICE_CHECK', 'SURVEY', 'PROMOTION'];
const TASK_STATUSES = ['DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED'];

type TaskRow = TaskDto & Record<string, unknown>;

function formatDateTime(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatStatus(status: string) {
  return TASK_STATUS_LABELS[status] || status.replaceAll('_', ' ');
}

export default function RegularTaskPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [outletFilter, setOutletFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const taskParams: TaskQueryParams = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    branchId: branchFilter || undefined,
    outletId: outletFilter || undefined,
    assigneeId: assigneeFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [assigneeFilter, branchFilter, dateFrom, dateTo, outletFilter, page, search, statusFilter, typeFilter]);

  const tasks = useTasks(taskParams);
  const branches = useBranches({ page: 1, limit: 100, isActive: 'true' });
  const outlets = useOutlets({ page: 1, limit: 100, branchId: branchFilter || undefined, isActive: 'true' });
  const employees = useEmployees({ page: 1, limit: 100, branchId: branchFilter || undefined, isActive: 'true' });

  const resetFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setBranchFilter('');
    setOutletFilter('');
    setAssigneeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleDelete = async (task: TaskDto) => {
    if (!window.confirm(`Xoa cong viec "${task.title}"?`)) return;

    setDeletingId(task.id);
    try {
      await deleteTask(task.id);
      toast.success('Da xoa cong viec');
      tasks.refetch();
    } catch (err) {
      toast.error(extractTaskErrorMessage(err, 'Xoa cong viec that bai'));
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<TaskRow>[] = useMemo(() => [
    {
      key: 'title',
      header: 'Cong viec',
      render: (task) => (
        <div className="min-w-[240px]">
          <p className="font-semibold text-[#191b23]">{task.title}</p>
          <p className="text-[12px] text-muted-foreground">{task.template?.name || task.description || 'Khong co mau'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loai',
      render: (task) => <TypeBadge type={TASK_TYPE_LABELS[task.type] || task.type} />,
    },
    {
      key: 'location',
      header: 'Dia diem',
      render: (task) => (
        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />{task.branch.name}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Store className="h-3.5 w-3.5" />{task.outlet?.name || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'assignees',
      header: 'Nhan vien',
      render: (task) => (
        <div className="flex max-w-[260px] flex-wrap gap-1.5">
          {task.assignments.slice(0, 3).map((assignment) => (
            <Badge key={assignment.id} variant="outline" className="gap-1">
              <User className="h-3 w-3" />{assignment.assignee.name}
            </Badge>
          ))}
          {task.assignments.length > 3 && <Badge variant="secondary">+{task.assignments.length - 3}</Badge>}
          {!task.assignments.length && <span className="text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Lich',
      render: (task) => (
        <span className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />{formatDateTime(task.scheduledDate || task.startTime)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trang thai',
      render: (task) => <StatusBadge status={formatStatus(task.status)} />,
    },
    {
      key: 'count',
      header: 'Bao cao',
      render: (task) => <Badge variant="outline">{task._count.reports} report</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (task) => (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionMenu
            actions={[
              {
                label: deletingId === task.id ? 'Dang xoa...' : 'Xoa',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => handleDelete(task),
                variant: 'destructive',
              },
            ]}
          />
        </div>
      ),
    },
  ], [deletingId, tasks]);

  return (
    <PageWrapper>
      <PageToolbar
        title="Danh sach cong viec"
        description={`${tasks.meta.total} cong viec`}
        searchPlaceholder="Tim task, branch, outlet, nhan vien..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        primaryAction={{
          label: 'Phan cong',
          onClick: () => window.location.assign('/tasks/scheduling'),
        }}
        secondaryActions={
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]" onClick={() => tasks.refetch()}>
              <RefreshCw className="h-3.5 w-3.5" />Tai lai
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1.5 text-[13px] ${showFilter ? 'border-[#0052cc] bg-[#0052cc]/10 text-[#0052cc]' : ''}`}
              onClick={() => setShowFilter((value) => !value)}
            >
              <Filter className="h-3.5 w-3.5" />Bo loc
            </Button>
          </>
        }
      />

      {showFilter && (
        <div className="mb-4 grid gap-3 rounded-lg border bg-white p-3 lg:grid-cols-4">
          <Select value={typeFilter || 'all'} onValueChange={(value) => { setTypeFilter(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Loai task" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca loai</SelectItem>
              {TASK_TYPES.map((type) => <SelectItem key={type} value={type}>{TASK_TYPE_LABELS[type] || type}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter || 'all'} onValueChange={(value) => { setStatusFilter(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Trang thai" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca trang thai</SelectItem>
              {TASK_STATUSES.map((status) => <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={branchFilter || 'all'} onValueChange={(value) => {
            setBranchFilter(value === 'all' ? '' : value);
            setOutletFilter('');
            setAssigneeFilter('');
            setPage(1);
          }}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Branch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca branch</SelectItem>
              {branches.data.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={outletFilter || 'all'} onValueChange={(value) => { setOutletFilter(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Outlet" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca outlet</SelectItem>
              {outlets.data.map((outlet) => <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter || 'all'} onValueChange={(value) => { setAssigneeFilter(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Nhan vien" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca nhan vien</SelectItem>
              {employees.data.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="space-y-1.5">
            <Label className="text-[12px]">Tu ngay</Label>
            <Input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="h-9 text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">Den ngay</Label>
            <Input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="h-9 text-[13px]" />
          </div>

          <Button variant="outline" size="sm" className="h-9 self-end justify-self-start" onClick={resetFilters}>
            Xoa bo loc
          </Button>
        </div>
      )}

      {tasks.error && (
        <div className="mb-4 whitespace-pre-line rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
          {tasks.error}
        </div>
      )}

      {tasks.loading && !tasks.data.length ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={tasks.data as TaskRow[]}
            selectable
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            getRowId={(row) => row.id}
            emptyMessage="Chua co cong viec"
          />
          <div className="mt-4">
            <Pagination page={page} totalPages={tasks.meta.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </PageWrapper>
  );
}
