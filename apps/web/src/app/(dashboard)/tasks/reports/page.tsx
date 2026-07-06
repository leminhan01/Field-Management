'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Image,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AdminReportDto, ReportQueryParams, ReportReviewStatus } from '@fieldapp/shared';
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS } from '@fieldapp/shared';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useReports } from '@/hooks/use-reports';
import { extractErrorMessage, reviewReport } from '@/lib/reports';

const PAGE_SIZE = 10;

type ReportRow = AdminReportDto & Record<string, unknown>;

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

function getReviewStatus(report: AdminReportDto): ReportReviewStatus {
  if (!report.reviewedAt) return 'PENDING';
  if (report.task.status === 'APPROVED') return 'APPROVED';
  if (report.task.status === 'REJECTED') return 'REJECTED';
  return 'PENDING';
}

function getReviewLabel(status: ReportReviewStatus) {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return 'Pending';
}

function formatChecklistKey(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

function formatChecklistValue(value: unknown) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString('vi-VN');
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function ReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReportReviewStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<AdminReportDto | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState<ReportReviewStatus | null>(null);

  const params: ReportQueryParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
  }), [page, search, status]);

  const reports = useReports(params);

  const handleOpenReport = (report: AdminReportDto) => {
    setSelectedReport(report);
    setReviewNotes(report.reviewNotes || '');
  };

  const handleReview = async (nextStatus: Exclude<ReportReviewStatus, 'PENDING'>) => {
    if (!selectedReport) return;

    setReviewing(nextStatus);
    try {
      const updated = await reviewReport(selectedReport.id, {
        status: nextStatus,
        reviewNotes: reviewNotes.trim() || undefined,
      });
      setSelectedReport(updated);
      toast.success(nextStatus === 'APPROVED' ? 'Report approved' : 'Report rejected');
      reports.refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to review report'));
    } finally {
      setReviewing(null);
    }
  };

  const columns: Column<ReportRow>[] = useMemo(() => [
    {
      key: 'task',
      header: 'Task',
      render: (report) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/tasks/regular/${report.task.id}`);
            }}
            className="flex max-w-[260px] items-center gap-2 text-left font-semibold text-[#191b23] hover:text-[#2563EB]"
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{report.task.title}</span>
          </button>
          <div className="mt-1 flex items-center gap-2">
            <TypeBadge type={TASK_TYPE_LABELS[report.task.type as keyof typeof TASK_TYPE_LABELS] || report.task.type} />
            <StatusBadge status={TASK_STATUS_LABELS[report.task.status as keyof typeof TASK_STATUS_LABELS] || report.task.status} />
          </div>
        </div>
      ),
    },
    {
      key: 'submittedBy',
      header: 'Assignee',
      render: (report) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <div>
            <p className="text-[13px] font-medium text-[#191b23]">{report.submittedBy.name}</p>
            <p className="text-[12px]">{report.submittedBy.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Location',
      render: (report) => (
        <div className="text-muted-foreground">
          <p className="flex items-center gap-1 text-[13px] font-medium text-[#191b23]">
            <MapPin className="h-3.5 w-3.5" />
            {report.task.branch.name}
          </p>
          <p className="text-[12px]">{report.task.outlet?.name || report.assignment.outlet?.name || '-'}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (report) => <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(report.createdAt)}</span>,
    },
    {
      key: 'photos',
      header: 'Photos',
      render: (report) => (
        <Badge variant="outline" className="gap-1">
          <Image className="h-3.5 w-3.5" />
          {report.photos.length}
        </Badge>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (report) => (
        report.rating == null ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {report.rating}/5
          </Badge>
        )
      ),
    },
    {
      key: 'reviewStatus',
      header: 'Review',
      render: (report) => <StatusBadge status={getReviewLabel(getReviewStatus(report))} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (report) => {
        const actions: ActionItem[] = [
          { label: 'View Detail', onClick: () => handleOpenReport(report), icon: <Eye className="h-4 w-4" /> },
        ];
        return (
          <div onClick={(event) => event.stopPropagation()}>
            <ActionMenu actions={actions} />
          </div>
        );
      },
    },
  ], [router]);

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search reports..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        secondaryActions={
          <>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as ReportReviewStatus | 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[150px] text-[13px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All reports</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]" disabled>
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </>
        }
      />

      {reports.error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {reports.error}
        </div>
      )}

      {reports.loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={reports.data as ReportRow[]}
          selectable
          getRowId={(report) => report.id}
          onRowClick={handleOpenReport}
          emptyMessage="No reports found"
        />
      )}

      <Pagination
        page={reports.meta.page}
        totalPages={reports.meta.totalPages}
        onPageChange={setPage}
      />

      <ReportDetailDialog
        report={selectedReport}
        reviewNotes={reviewNotes}
        reviewing={reviewing}
        onOpenChange={(open) => {
          if (!open) setSelectedReport(null);
        }}
        onNotesChange={setReviewNotes}
        onReview={handleReview}
        onPhotoClick={setSelectedPhoto}
      />

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl border-0 bg-black/90 p-2">
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Report photo"
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

function ReportDetailDialog({
  report,
  reviewNotes,
  reviewing,
  onOpenChange,
  onNotesChange,
  onReview,
  onPhotoClick,
}: {
  report: AdminReportDto | null;
  reviewNotes: string;
  reviewing: ReportReviewStatus | null;
  onOpenChange: (open: boolean) => void;
  onNotesChange: (value: string) => void;
  onReview: (status: Exclude<ReportReviewStatus, 'PENDING'>) => void;
  onPhotoClick: (url: string) => void;
}) {
  const checklistEntries = Object.entries(report?.checklistData || {});
  const reviewStatus = report ? getReviewStatus(report) : 'PENDING';

  return (
    <Dialog open={!!report} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        {report && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[18px]">
                <FileText className="h-5 w-5 text-[#2563EB]" />
                Report detail
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-[#f9fafb] p-4">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#191b23]">{report.task.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <TypeBadge type={TASK_TYPE_LABELS[report.task.type as keyof typeof TASK_TYPE_LABELS] || report.task.type} />
                    <StatusBadge status={getReviewLabel(reviewStatus)} />
                  </div>
                </div>
                <div className="text-right text-[12px] text-muted-foreground">
                  <p>Submitted {formatDateTime(report.createdAt)}</p>
                  {report.reviewedAt && <p>Reviewed {formatDateTime(report.reviewedAt)}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoBlock icon={User} label="Assignee" value={report.submittedBy.name} detail={report.submittedBy.email} />
                <InfoBlock icon={MapPin} label="Branch" value={report.task.branch.name} detail={report.task.outlet?.name || report.assignment.outlet?.name || '-'} />
                <InfoBlock icon={MessageSquare} label="Notes" value={report.notes || '-'} />
              </div>

              {checklistEntries.length > 0 && (
                <section>
                  <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Checklist</h3>
                  <div className="grid gap-2 rounded-lg border bg-white p-3 md:grid-cols-2">
                    {checklistEntries.map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-3 rounded-md bg-[#f9fafb] px-3 py-2 text-[13px]">
                        <span className="text-muted-foreground">{formatChecklistKey(key)}</span>
                        <span className="text-right font-medium text-[#191b23]">{formatChecklistValue(value)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Photos ({report.photos.length})
                </h3>
                {report.photos.length === 0 ? (
                  <div className="rounded-lg border bg-[#f9fafb] p-4 text-[13px] text-muted-foreground">No photos submitted</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {report.photos.map((url, index) => (
                      <button
                        key={`${url}-${index}`}
                        type="button"
                        onClick={() => onPhotoClick(url)}
                        className="group relative h-24 w-24 overflow-hidden rounded-lg border bg-[#f9fafb]"
                      >
                        <img
                          src={url}
                          alt={`Report photo ${index + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <Separator />

              <section className="space-y-3">
                <div>
                  <h3 className="text-[13px] font-semibold text-[#191b23]">Review notes</h3>
                  <p className="text-[12px] text-muted-foreground">Notes are visible in the admin review history.</p>
                </div>
                <Textarea
                  value={reviewNotes}
                  onChange={(event) => onNotesChange(event.target.value)}
                  placeholder="Add review notes..."
                  className="min-h-[90px] text-[13px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={!!reviewing}
                    onClick={() => onReview('REJECTED')}
                  >
                    {reviewing === 'REJECTED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
                    disabled={!!reviewing}
                    onClick={() => onReview('APPROVED')}
                  >
                    {reviewing === 'APPROVED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </Button>
                </div>
              </section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-[13px] font-medium text-[#191b23]">{value}</p>
      {detail && <p className="mt-1 text-[12px] text-muted-foreground">{detail}</p>}
    </div>
  );
}
