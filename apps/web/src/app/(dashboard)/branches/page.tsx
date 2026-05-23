'use client';

import { useCallback, useMemo, useState } from 'react';
import { Building2, Filter, Loader2, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BRANCH_TYPE_LABELS } from '@fieldapp/shared';
import type { BranchDto, BranchQueryParams, CreateBranchInput, UpdateBranchInput } from '@fieldapp/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { ActionMenu } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';
import { BranchFilter } from '@/components/branches/branch-filter';
import { BranchForm } from '@/components/branches/branch-form';
import { useBranches } from '@/hooks/use-branches';
import { useBranchMutations } from '@/hooks/use-branch-mutations';
import { extractBranchErrorMessage } from '@/lib/branches';

type BranchRow = BranchDto & Record<string, unknown>;

export default function BranchesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BranchDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const params: BranchQueryParams = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    type: typeFilter || undefined,
    isActive: statusFilter || undefined,
  }), [page, search, typeFilter, statusFilter]);

  const { data, meta, loading, refetch } = useBranches(params);
  const { create, update, remove } = useBranchMutations();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setTypeFilter('');
    setStatusFilter('');
    setPage(1);
  }, []);

  const handleFormSubmit = useCallback(async (formData: Record<string, unknown>) => {
    try {
      if (editingBranch) {
        await update(editingBranch.id, formData as UpdateBranchInput);
        toast.success('Branch updated successfully');
      } else {
        await create(formData as unknown as CreateBranchInput);
        toast.success('Branch created successfully');
      }

      refetch();
    } catch (err) {
      const msg = extractBranchErrorMessage(
        err,
        editingBranch ? 'Failed to update branch' : 'Failed to create branch',
      );
      toast.error(msg);
      throw err;
    }
  }, [create, editingBranch, refetch, update]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      toast.success(`Deleted branch ${deleteTarget.name}`);
      refetch();
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractBranchErrorMessage(err, 'Failed to delete branch'));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, refetch, remove]);

  const columns: Column<BranchRow>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Branch name',
      render: (branch) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-[#191b23]">{branch.name}</p>
            <p className="text-[12px] text-muted-foreground font-mono">{branch.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Division',
      render: (branch) => <TypeBadge type={BRANCH_TYPE_LABELS[branch.type] || branch.type} />,
    },
    {
      key: 'region',
      header: 'Region',
      render: (branch) => (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          {branch.region?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      className: 'max-w-[240px]',
      render: (branch) => <span className="text-muted-foreground truncate block">{branch.address || '—'}</span>,
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (branch) => <span className="text-muted-foreground">{branch.manager?.name || '—'}</span>,
    },
    {
      key: 'staff',
      header: 'Staff',
      render: (branch) => (
        <Avatar className="w-7 h-7">
          <AvatarFallback className="bg-muted text-[12px] font-semibold">{branch._count.employees}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (branch) => <StatusBadge status={branch.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (branch) => (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionMenu
            actions={[
              {
                label: 'Edit',
                onClick: () => {
                  setEditingBranch(branch);
                  setShowForm(true);
                },
              },
              {
                label: 'Delete',
                onClick: () => setDeleteTarget(branch),
                variant: 'destructive',
              },
            ]}
          />
        </div>
      ),
    },
  ], []);

  return (
    <PageWrapper>
      <PageToolbar
        title="Branch management"
        description={`${meta.total} branches`}
        searchPlaceholder="Search branches..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        primaryAction={{
          label: 'Add branch',
          onClick: () => {
            setEditingBranch(null);
            setShowForm(true);
          },
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
        <BranchFilter
          type={typeFilter}
          isActive={statusFilter}
          onTypeChange={(value) => {
            setTypeFilter(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
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
            data={data as BranchRow[]}
            selectable
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            getRowId={(row) => row.id}
            emptyMessage="No branches found"
          />
          <div className="mt-4">
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <BranchForm
        open={showForm}
        mode={editingBranch ? 'edit' : 'create'}
        branch={editingBranch}
        onClose={() => {
          setShowForm(false);
          setEditingBranch(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete branch <strong>{deleteTarget?.name}</strong>?
              Branches with employees or related data cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
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
    </PageWrapper>
  );
}
