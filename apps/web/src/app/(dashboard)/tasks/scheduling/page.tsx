'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CalendarDays, CheckCircle2, Loader2, RefreshCw, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { BulkAssignScheduleMode, BulkAssignWeekday } from '@fieldapp/shared';
import { TASK_TYPE_LABELS } from '@fieldapp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { TypeBadge } from '@/components/shared/status-badge';
import { useBranches } from '@/hooks/use-branches';
import { useEmployees } from '@/hooks/use-employees';
import { useOutlets } from '@/hooks/use-outlets';
import { useTaskGroups, useTaskTemplates } from '@/hooks/use-task-management';
import { bulkAssignTasks, extractTaskManagementErrorMessage } from '@/lib/task-management';

const WEEKDAY_OPTIONS: Array<{ value: BulkAssignWeekday; label: string }> = [
  { value: 'MON', label: 'T2' },
  { value: 'TUE', label: 'T3' },
  { value: 'WED', label: 'T4' },
  { value: 'THU', label: 'T5' },
  { value: 'FRI', label: 'T6' },
  { value: 'SAT', label: 'T7' },
  { value: 'SUN', label: 'CN' },
];

const EMPTY_FORM = {
  branchId: '',
  employeeIds: [] as string[],
  outletIds: [] as string[],
  templateIds: [] as string[],
  taskGroupIds: [] as string[],
  scheduleMode: 'SINGLE' as BulkAssignScheduleMode,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  weekdays: [] as BulkAssignWeekday[],
  startTime: '08:00',
  titlePrefix: '',
};

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function toggleWeekday(values: BulkAssignWeekday[], value: BulkAssignWeekday) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function getDateCount(startDate: string, endDate: string, mode: BulkAssignScheduleMode, weekdays: BulkAssignWeekday[]) {
  if (!startDate) return 0;
  if (mode === 'SINGLE') return 1;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${(endDate || startDate)}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  const weekdayIndex: Record<BulkAssignWeekday, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
  const allowed = mode === 'WEEKLY' ? new Set(weekdays.map((weekday) => weekdayIndex[weekday])) : null;
  let count = 0;

  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (!allowed || allowed.has(cursor.getDay())) count += 1;
  }

  return count;
}

export default function SchedulingPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [outletSearch, setOutletSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const branches = useBranches({ page: 1, limit: 100, isActive: 'true' });
  const employees = useEmployees({ page: 1, limit: 100, branchId: form.branchId || undefined, isActive: 'true', search: employeeSearch || undefined });
  const outlets = useOutlets({ page: 1, limit: 100, branchId: form.branchId || undefined, isActive: 'true', search: outletSearch || undefined });
  const templates = useTaskTemplates({ page: 1, limit: 100, isActive: 'true' });
  const groups = useTaskGroups({ page: 1, limit: 100, isActive: 'true' });

  const selectedWorkItemCount = form.templateIds.length + form.taskGroupIds.length;
  const dateCount = getDateCount(form.startDate, form.endDate, form.scheduleMode, form.weekdays);
  const estimatedAssignments = dateCount * form.employeeIds.length * form.outletIds.length * Math.max(selectedWorkItemCount, 1);

  const canSubmit = useMemo(() => (
    Boolean(form.branchId)
    && form.employeeIds.length > 0
    && form.outletIds.length > 0
    && selectedWorkItemCount > 0
    && Boolean(form.startDate)
    && (form.scheduleMode === 'SINGLE' || Boolean(form.endDate))
    && (form.scheduleMode !== 'WEEKLY' || form.weekdays.length > 0)
  ), [form, selectedWorkItemCount]);

  const handleBranchChange = (branchId: string) => {
    setForm((current) => ({
      ...current,
      branchId,
      employeeIds: [],
      outletIds: [],
    }));
    setEmployeeSearch('');
    setOutletSearch('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Please select a branch, employee, outlet, task template/group, and schedule');
      return;
    }

    setSubmitting(true);
    try {
      const result = await bulkAssignTasks({
        branchId: form.branchId,
        employeeIds: form.employeeIds,
        outletIds: form.outletIds,
        templateIds: form.templateIds.length ? form.templateIds : undefined,
        taskGroupIds: form.taskGroupIds.length ? form.taskGroupIds : undefined,
        scheduleMode: form.scheduleMode,
        startDate: form.startDate,
        endDate: form.scheduleMode === 'SINGLE' ? undefined : form.endDate,
        weekdays: form.scheduleMode === 'WEEKLY' ? form.weekdays : undefined,
        startTime: form.startTime || undefined,
        titlePrefix: form.titlePrefix.trim() || undefined,
      });

      toast.success(`Created ${result.taskCount} tasks and ${result.assignmentCount} assignments`);
      setForm({ ...EMPTY_FORM, startDate: form.startDate, startTime: form.startTime });
    } catch (err) {
      toast.error(extractTaskManagementErrorMessage(err, 'Assignment failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <PageToolbar
        title="Schedule assignments"
        description="Create tasks from templates or task groups for employees by outlet"
        searchPlaceholder="Tim nhanh nhan vien..."
        searchValue={employeeSearch}
        onSearchChange={setEmployeeSearch}
        primaryAction={{
          label: submitting ? 'Dang assignments' : 'Assign',
          onClick: handleSubmit,
        }}
        secondaryActions={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[13px]"
            onClick={() => {
              branches.refetch();
              employees.refetch();
              outlets.refetch();
              templates.refetch();
              groups.refetch();
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />Tai lai
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="border p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Branch *</Label>
                <Select value={form.branchId} onValueChange={handleBranchChange}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Chon branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.data.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Kieu lich *</Label>
                <Select value={form.scheduleMode} onValueChange={(value) => setForm({ ...form, scheduleMode: value as BulkAssignScheduleMode })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Mot ngay</SelectItem>
                    <SelectItem value="RANGE">Khoang ngay</SelectItem>
                    <SelectItem value="WEEKLY">Lap theo thu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tien to task</Label>
                <Input value={form.titlePrefix} onChange={(e) => setForm({ ...form, titlePrefix: e.target.value })} className="h-9 text-[13px]" placeholder="VD: Campaign Q2" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Ngay bat dau *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="h-9 text-[13px]" />
              </div>
              {form.scheduleMode !== 'SINGLE' && (
                <div className="space-y-1.5">
                  <Label>Ngay ket thuc *</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="h-9 text-[13px]" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Gio bat dau</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="h-9 text-[13px]" />
              </div>
            </div>

            {form.scheduleMode === 'WEEKLY' && (
              <div className="mt-4 space-y-2">
                <Label>Lap lai vao thu *</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTIONS.map((weekday) => (
                    <Button
                      key={weekday.value}
                      type="button"
                      variant={form.weekdays.includes(weekday.value) ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 min-w-12 text-[13px]"
                      onClick={() => setForm({ ...form, weekdays: toggleWeekday(form.weekdays, weekday.value) })}
                    >
                      {weekday.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <SelectionPanel
              title="Employee"
              count={form.employeeIds.length}
              loading={employees.loading}
              error={employees.error}
              emptyMessage={form.branchId ? 'Khong co nhan vien phu hop' : 'Chon branch de tai nhan vien'}
              toolbar={
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} placeholder="Tim nhan vien" className="h-9 pl-8 text-[13px]" />
                </div>
              }
            >
              {employees.data.map((employee) => (
                <label key={employee.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                  <Checkbox checked={form.employeeIds.includes(employee.id)} onCheckedChange={() => setForm({ ...form, employeeIds: toggleValue(form.employeeIds, employee.id) })} />
                  <span className="flex-1 text-[13px] font-medium">{employee.name}</span>
                  <Badge variant="outline">{employee.branch?.code || 'No branch'}</Badge>
                </label>
              ))}
            </SelectionPanel>

            <SelectionPanel
              title="Outlet"
              count={form.outletIds.length}
              loading={outlets.loading}
              error={outlets.error}
              emptyMessage={form.branchId ? 'No outlets found phu hop' : 'Chon branch de tai outlet'}
              toolbar={
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={outletSearch} onChange={(e) => setOutletSearch(e.target.value)} placeholder="Tim outlet" className="h-9 pl-8 text-[13px]" />
                </div>
              }
            >
              {outlets.data.map((outlet) => (
                <label key={outlet.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                  <Checkbox checked={form.outletIds.includes(outlet.id)} onCheckedChange={() => setForm({ ...form, outletIds: toggleValue(form.outletIds, outlet.id) })} />
                  <span className="flex-1 text-[13px] font-medium">{outlet.name}</span>
                  <Badge variant="outline">{outlet.code}</Badge>
                </label>
              ))}
            </SelectionPanel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SelectionPanel title="Task templates" count={form.templateIds.length} loading={templates.loading} emptyMessage="No active task templates yet">
              {templates.data.map((template) => (
                <label key={template.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                  <Checkbox checked={form.templateIds.includes(template.id)} onCheckedChange={() => setForm({ ...form, templateIds: toggleValue(form.templateIds, template.id) })} />
                  <span className="flex-1 text-[13px] font-medium">{template.name}</span>
                  <TypeBadge type={TASK_TYPE_LABELS[template.type] || template.type} />
                </label>
              ))}
            </SelectionPanel>

            <SelectionPanel title="Task groups" count={form.taskGroupIds.length} loading={groups.loading} emptyMessage="No active task groups yet">
              {groups.data.map((group) => (
                <label key={group.id} className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted">
                  <Checkbox className="mt-0.5" checked={form.taskGroupIds.includes(group.id)} onCheckedChange={() => setForm({ ...form, taskGroupIds: toggleValue(form.taskGroupIds, group.id) })} />
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium">{group.name}</span>
                    <span className="block text-[12px] text-muted-foreground">{group.templates.length} task templates</span>
                  </span>
                  <Badge variant="outline">{group.code}</Badge>
                </label>
              ))}
            </SelectionPanel>
          </div>
        </div>

        <Card className="h-fit border p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="text-[14px] font-semibold">Tom tat assignments</h2>
          </div>
          <div className="mt-4 space-y-3 text-[13px]">
            <SummaryRow label="Employee" value={form.employeeIds.length} />
            <SummaryRow label="Outlet" value={form.outletIds.length} />
            <SummaryRow label="Mau rieng" value={form.templateIds.length} />
            <SummaryRow label="Nhom" value={form.taskGroupIds.length} />
            <SummaryRow label="Ngay tao lich" value={dateCount} />
            <SummaryRow label="Uoc tinh assignments" value={estimatedAssignments} strong />
          </div>
          <Button className="mt-5 h-9 w-full gap-2 bg-[#2563EB] text-[13px] hover:bg-[#1D4ED8]" disabled={submitting || !canSubmit} onClick={handleSubmit}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Assign ngay
          </Button>
          <Button variant="outline" className="mt-2 h-9 w-full gap-2 text-[13px]" onClick={() => setForm(EMPTY_FORM)} disabled={submitting}>
            <Users className="h-4 w-4" />Delete lua chon
          </Button>
        </Card>
      </div>
    </PageWrapper>
  );
}

function SelectionPanel({
  title,
  count,
  loading,
  error,
  emptyMessage,
  toolbar,
  children,
}: {
  title: string;
  count: number;
  loading: boolean;
  error?: string | null;
  emptyMessage: string;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="border p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold">{title}</h2>
          <p className="text-[12px] text-muted-foreground">Da chon {count}</p>
        </div>
        {toolbar}
      </div>
      <div className="max-h-[320px] space-y-1 overflow-y-auto rounded-md border p-2">
        {loading ? (
          <div className="flex h-28 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : error ? (
          <p className="whitespace-pre-line py-8 text-center text-[13px] text-red-600">{error}</p>
        ) : children && (Array.isArray(children) ? children.length > 0 : true) ? (
          children
        ) : (
          <p className="py-8 text-center text-[13px] text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </Card>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? 'text-[16px] font-bold text-primary' : 'font-semibold'}>{value}</span>
    </div>
  );
}
