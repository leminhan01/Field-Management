'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileText,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Store,
  User,
} from 'lucide-react';
import { OUTLET_TYPE_LABELS, TASK_STATUS_LABELS, TASK_TYPE_LABELS } from '@fieldapp/shared';
import type { TaskDto, TaskQueryParams } from '@fieldapp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { useOutlet } from '@/hooks/use-outlet';
import { useTasks } from '@/hooks/use-tasks';

type TaskRow = TaskDto & Record<string, unknown>;

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

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

export default function OutletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [page, setPage] = useState(1);

  const { data: outlet, loading: outletLoading, error: outletError } = useOutlet(id);
  const taskParams: TaskQueryParams = useMemo(() => ({
    page,
    limit: 10,
    outletId: id,
  }), [id, page]);
  const tasks = useTasks(taskParams);
  const completedTasks = useTasks({ page: 1, limit: 1, outletId: id, status: 'COMPLETED' });
  const approvedTasks = useTasks({ page: 1, limit: 1, outletId: id, status: 'APPROVED' });
  const assignedTasks = useTasks({ page: 1, limit: 1, outletId: id, status: 'ASSIGNED' });
  const inProgressTasks = useTasks({ page: 1, limit: 1, outletId: id, status: 'IN_PROGRESS' });

  const doneTaskCount = completedTasks.meta.total + approvedTasks.meta.total;
  const activeTaskCount = assignedTasks.meta.total + inProgressTasks.meta.total;
  const reportCount = tasks.data.reduce((total, task) => total + task._count.reports, 0);

  const columns: Column<TaskRow>[] = useMemo(() => [
    {
      key: 'title',
      header: 'Task',
      render: (task) => (
        <div className="min-w-[240px]">
          <p className="font-semibold text-[#191b23]">{task.title}</p>
          <p className="text-[12px] text-muted-foreground">{task.template?.name || task.description || 'No template'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (task) => <TypeBadge type={TASK_TYPE_LABELS[task.type] || task.type} />,
    },
    {
      key: 'assignees',
      header: 'Employees',
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
      header: 'Schedule',
      render: (task) => (
        <span className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />{formatDateTime(task.scheduledDate || task.startTime)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (task) => <StatusBadge status={formatStatus(task.status)} />,
    },
    {
      key: 'reports',
      header: 'Reports',
      render: (task) => <Badge variant="outline">{task._count.reports} report</Badge>,
    },
  ], []);

  if (outletLoading) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (outletError || !outlet) {
    return (
      <PageWrapper>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{outletError || 'Outlet not found'}</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/outlets')}>
            <ArrowLeft className="mr-1 h-4 w-4" />Back to outlets
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/outlets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-[22px] font-semibold leading-tight text-[#191b23]">Outlet details</h1>
            <p className="mt-1 text-[14px] text-[#434654]">Outlets / {outlet.name}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => tasks.refetch()}>
          <RefreshCw className="mr-1 h-4 w-4" />Refresh tasks
        </Button>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-4">
        <SummaryCard label="Total tasks" value={tasks.meta.total} icon={ClipboardCheck} />
        <SummaryCard label="Done tasks" value={doneTaskCount} icon={FileText} />
        <SummaryCard label="Active tasks" value={activeTaskCount} icon={CalendarClock} />
        <SummaryCard label="Reports shown" value={reportCount} icon={FileText} />
      </div>

      <Card className="mb-6 border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[20px] font-semibold text-[#191b23]">{outlet.name}</h2>
                  <StatusBadge status={outlet.isActive ? 'Active' : 'Inactive'} />
                  <TypeBadge type={OUTLET_TYPE_LABELS[outlet.type] || outlet.type} />
                </div>
                <p className="mt-1 font-mono text-[12px] text-muted-foreground">{outlet.code}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
            <InfoItem icon={Building2} label="Managing branch" value={`${outlet.branch.name} (${outlet.branch.code})`} />
            <InfoItem icon={Store} label="Brand" value={outlet.brand || '-'} />
            <InfoItem icon={Phone} label="Phone" value={outlet.phone || '-'} />
            <InfoItem icon={MapPin} label="Address" value={outlet.address || '-'} />
            <InfoItem icon={CalendarClock} label="Created at" value={formatDate(outlet.createdAt)} />
            <InfoItem icon={CalendarClock} label="Updated at" value={formatDate(outlet.updatedAt)} />
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[#191b23]">Tasks at this outlet</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{tasks.meta.total} task recorded for {outlet.name}</p>
        </div>
      </div>

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
            getRowId={(row) => row.id}
            onRowClick={(row) => router.push(`/tasks/regular/${row.id}`)}
            emptyMessage="No tasks found for this outlet"
          />
          <div className="mt-4">
            <Pagination page={page} totalPages={tasks.meta.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </PageWrapper>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-[24px] font-semibold text-[#191b23]">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8edfb] text-[#0052cc]">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <p className="text-[13px] text-[#191b23]">{value}</p>
      </div>
    </div>
  );
}
