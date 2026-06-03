'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { getSurveyColumns } from '@/components/surveys/survey-columns';
import { SurveyFilter } from '@/components/surveys/survey-filter';
import { SurveyForm } from '@/components/surveys/survey-form';
import { SurveyDetailDialog } from '@/components/surveys/survey-detail-dialog';
import { useSurveys } from '@/hooks/use-surveys';
import { useSurveyMutations } from '@/hooks/use-survey-mutations';
import { extractErrorMessage } from '@/lib/surveys';
import type { SurveyDto, SurveyQueryParams } from '@fieldapp/shared';

export default function SurveysPage() {
  const router = useRouter();

  // Filter & pagination state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Dialog state
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<SurveyDto | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<SurveyDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SurveyDto | null>(null);
  const [statusTarget, setStatusTarget] = useState<SurveyDto | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  // Build query params
  const params: SurveyQueryParams = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    status: (statusFilter || undefined) as any,
  }), [page, search, statusFilter]);

  const { data, meta, loading, refetch } = useSurveys(params);
  const { create, update, remove, changeStatus } = useSurveyMutations();

  const columns = useMemo(() => getSurveyColumns({
    onEdit: (s) => { setEditingSurvey(s); setShowForm(true); },
    onView: (s) => router.push(`/surveys/${s.id}`),
    onDelete: (s) => setDeleteTarget(s),
    onStatusChange: (s, status) => { setStatusTarget(s); setNewStatus(status); },
  }), [router]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter('');
    setPage(1);
  }, []);

  const handleFormSubmit = useCallback(async (formData: any) => {
    try {
      if (editingSurvey) {
        await update(editingSurvey.id, formData);
        toast.success('Survey updated successfully');
      } else {
        await create(formData);
        toast.success('Survey created successfully');
      }
      refetch();
    } catch (err) {
      const msg = extractErrorMessage(err, editingSurvey ? 'Failed to update survey' : 'Failed to create survey');
      toast.error(msg);
      throw err;
    }
  }, [editingSurvey, create, update, refetch]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      toast.success(`Deleted survey "${deleteTarget.title}"`);
      refetch();
      setDeleteTarget(null);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to delete survey');
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, remove, refetch]);

  const handleStatusChange = useCallback(async () => {
    if (!statusTarget || !newStatus) return;
    setChangingStatus(true);
    try {
      await changeStatus(statusTarget.id, newStatus);
      toast.success(`Survey status changed to ${newStatus}`);
      refetch();
      setStatusTarget(null);
      setNewStatus('');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to change survey status');
      toast.error(msg);
    } finally {
      setChangingStatus(false);
    }
  }, [statusTarget, newStatus, changeStatus, refetch]);

  return (
    <PageWrapper>
      <PageToolbar
        title="Survey management"
        description={`${meta.total} surveys`}
        searchPlaceholder="Search surveys..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        primaryAction={{
          label: 'Create Survey',
          onClick: () => { setEditingSurvey(null); setShowForm(true); },
        }}
        secondaryActions={
          <Button
            variant="outline"
            size="sm"
            className={`h-8 gap-1.5 text-[13px] ${showFilter ? 'bg-[#0052cc]/10 text-[#0052cc] border-[#0052cc]' : ''}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter className="w-3.5 h-3.5" />Filters
          </Button>
        }
      />

      {showFilter && (
        <SurveyFilter
          status={statusFilter}
          onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
          onClear={handleClearFilters}
        />
      )}

      {loading && !data.length ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data as any[]}
            getRowId={(row) => (row as SurveyDto).id}
          />
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <SurveyForm
        open={showForm}
        mode={editingSurvey ? 'edit' : 'create'}
        survey={editingSurvey}
        onClose={() => { setShowForm(false); setEditingSurvey(null); }}
        onSubmit={handleFormSubmit}
      />

      {/* View Detail Dialog */}
      <SurveyDetailDialog
        open={!!viewingSurvey}
        survey={viewingSurvey}
        onClose={() => setViewingSurvey(null)}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete survey <strong>{deleteTarget?.title}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirm Dialog */}
      <Dialog open={!!statusTarget} onOpenChange={(v) => !v && setStatusTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change survey status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change <strong>{statusTarget?.title}</strong> status to{' '}
              <strong>{newStatus}</strong>?
              {newStatus === 'ACTIVE' && ' The survey will be available for field staff to fill out.'}
              {newStatus === 'CLOSED' && ' The survey will no longer accept responses.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleStatusChange} disabled={changingStatus} className="bg-[#0052cc] hover:bg-[#003d9b]">
              {changingStatus && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
