'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Star,
  Store,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS } from '@fieldapp/shared';
import type { TaskReportDto } from '@fieldapp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { useTask } from '@/hooks/use-task';
import { deleteTask, extractTaskErrorMessage } from '@/lib/tasks';

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatChecklistValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString('vi-VN');
  return String(value);
}

function formatChecklistKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: task, loading, error } = useTask(id);
  const [deleting, setDeleting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm(`Delete task "${task.title}"?`)) return;

    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      router.push('/tasks/regular');
    } catch (err) {
      toast.error(extractTaskErrorMessage(err, 'Failed to delete task'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !task) {
    return (
      <PageWrapper>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{error || 'Task not found'}</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/tasks/regular')}>
            <ArrowLeft className="mr-1 h-4 w-4" />Back to tasks
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/tasks/regular')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-[22px] font-semibold leading-tight text-[#191b23]">Task details</h1>
            <p className="mt-1 text-[14px] text-[#434654]">Tasks / {task.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
            Delete
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          {/* Task Info Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-semibold text-[#191b23]">{task.title}</h2>
                <StatusBadge status={TASK_STATUS_LABELS[task.status] || task.status} />
                <TypeBadge type={TASK_TYPE_LABELS[task.type] || task.type} />
              </div>
              {task.description && (
                <p className="text-[14px] text-muted-foreground">{task.description}</p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Task Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <InfoItem icon={MapPin} label="Branch" value={task.branch.name} />
            <InfoItem icon={Store} label="Outlet" value={task.outlet?.name || '—'} />
            <InfoItem
              icon={FileText}
              label="Template"
              value={task.template?.name || '—'}
            />
            <InfoItem
              icon={Clock}
              label="Est. duration"
              value={task.template?.estimatedDuration ? `${task.template.estimatedDuration} min` : '—'}
            />
            <InfoItem
              icon={CalendarClock}
              label="Scheduled date"
              value={formatDate(task.scheduledDate)}
            />
            <InfoItem
              icon={CalendarClock}
              label="Start time"
              value={formatDateTime(task.startTime)}
            />
            <InfoItem
              icon={CalendarClock}
              label="End time"
              value={formatDateTime(task.endTime)}
            />
            <InfoItem
              icon={User}
              label="Created by"
              value={task.createdBy.name}
            />
          </div>

          <Separator className="my-6" />

          {/* Assignments Section */}
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-[#191b23]">
              Assignments ({task.assignments.length})
            </h3>
            {task.assignments.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No assignments yet</p>
            ) : (
              <div className="space-y-3">
                {task.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-lg border bg-[#f9fafb] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B5CF6] text-[12px] font-bold text-white">
                        {assignment.assignee.name.split(' ').map((n) => n[0]).join('').slice(-2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#191b23]">{assignment.assignee.name}</p>
                        <p className="text-[12px] text-muted-foreground">{assignment.assignee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {assignment.outlet && (
                        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                          <Store className="h-3 w-3" />
                          {assignment.outlet.name}
                        </span>
                      )}
                      <span className="text-[12px] text-muted-foreground">
                        {formatDateTime(assignment.scheduledAt)}
                      </span>
                      <StatusBadge status={TASK_STATUS_LABELS[assignment.status] || assignment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Reports Section */}
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-[#191b23]">
              Reports ({task.reports.length})
            </h3>
            {task.reports.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No reports submitted yet</p>
            ) : (
              <div className="space-y-4">
                {task.reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onPhotoClick={setSelectedPhoto}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl border-0 bg-black/90 p-2">
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Report photo"
              className="h-auto w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

/* ─── Sub-components ─── */

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
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <p className="text-[13px] text-[#191b23]">{value}</p>
      </div>
    </div>
  );
}

function ReportCard({
  report,
  onPhotoClick,
}: {
  report: TaskReportDto;
  onPhotoClick: (url: string) => void;
}) {
  const checklistEntries = Object.entries(report.checklistData || {});

  return (
    <div className="rounded-lg border bg-white">
      {/* Report Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B5CF6] text-[12px] font-bold text-white">
            {report.submittedBy.name.split(' ').map((n) => n[0]).join('').slice(-2)}
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#191b23]">{report.submittedBy.name}</p>
            <p className="text-[12px] text-muted-foreground">{report.submittedBy.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {report.rating != null && (
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {report.rating}/5
            </Badge>
          )}
          <span className="text-[12px] text-muted-foreground">
            {formatDateTime(report.createdAt)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Checklist Data */}
        {checklistEntries.length > 0 && (
          <div>
            <p className="mb-2 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
              Checklist
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-lg bg-[#f9fafb] p-3">
              {checklistEntries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{formatChecklistKey(key)}</span>
                  <span className="font-medium text-[#191b23]">{formatChecklistValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {report.notes && (
          <div>
            <p className="mb-2 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
              Notes
            </p>
            <p className="text-[13px] text-[#191b23] whitespace-pre-wrap rounded-lg bg-[#f9fafb] p-3">
              {report.notes}
            </p>
          </div>
        )}

        {/* Photos */}
        {report.photos.length > 0 && (
          <div>
            <p className="mb-2 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
              Photos ({report.photos.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {report.photos.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onPhotoClick(url)}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-[#f9fafb] transition-shadow hover:shadow-md"
                >
                  <img
                    src={url}
                    alt={`Report photo ${index + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <ImageIcon className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Review Info */}
        {report.reviewedById && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                <User className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">
                  Reviewed by <span className="font-medium text-[#191b23]">{report.reviewedBy?.name || '—'}</span>
                  {report.reviewedAt && ` · ${formatDateTime(report.reviewedAt)}`}
                </p>
                {report.reviewNotes && (
                  <p className="mt-1 text-[13px] text-[#191b23]">{report.reviewNotes}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
