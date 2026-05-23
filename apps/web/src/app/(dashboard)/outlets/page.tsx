'use client';

import { useCallback, useMemo, useState } from 'react';
import { Building2, Filter, Loader2, MapPin, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { OUTLET_TYPE_LABELS } from '@fieldapp/shared';
import type { CreateOutletInput, OutletDto, OutletQueryParams, UpdateOutletInput } from '@fieldapp/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { ActionMenu } from '@/components/shared/action-menu';
import { Pagination } from '@/components/shared/pagination';
import { OutletFilter } from '@/components/outlets/outlet-filter';
import { OutletForm } from '@/components/outlets/outlet-form';
import { useOutlets } from '@/hooks/use-outlets';
import { useOutletMutations } from '@/hooks/use-outlet-mutations';
import { extractOutletErrorMessage } from '@/lib/outlets';

type OutletRow = OutletDto & Record<string, unknown>;

export default function OutletsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<OutletDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OutletDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const params: OutletQueryParams = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    type: typeFilter || undefined,
    branchId: branchFilter || undefined,
    isActive: statusFilter || undefined,
  }), [page, search, typeFilter, branchFilter, statusFilter]);

  const { data, meta, loading, refetch } = useOutlets(params);
  const { create, update, remove } = useOutletMutations();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setTypeFilter('');
    setBranchFilter('');
    setStatusFilter('');
    setPage(1);
  }, []);

  const handleFormSubmit = useCallback(async (formData: Record<string, unknown>) => {
    try {
      if (editingOutlet) {
        await update(editingOutlet.id, formData as UpdateOutletInput);
        toast.success('Outlet updated successfully');
      } else {
        await create(formData as unknown as CreateOutletInput);
        toast.success('Outlet created successfully');
      }

      refetch();
    } catch (err) {
      const msg = extractOutletErrorMessage(
        err,
        editingOutlet ? 'Failed to update outlet' : 'Failed to create outlet',
      );
      toast.error(msg);
      throw err;
    }
  }, [create, editingOutlet, refetch, update]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      toast.success(`Deleted outlet ${deleteTarget.name}`);
      refetch();
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractOutletErrorMessage(err, 'Failed to delete outlet'));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, refetch, remove]);

  const columns: Column<OutletRow>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Outlet',
      render: (outlet) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-[#191b23]">{outlet.name}</p>
            <p className="text-[12px] text-muted-foreground font-mono">{outlet.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Managing branch',
      render: (outlet) => <span className="text-muted-foreground">{outlet.branch.name}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (outlet) => <TypeBadge type={OUTLET_TYPE_LABELS[outlet.type] || outlet.type} />,
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (outlet) => <span className="text-muted-foreground">{outlet.brand || '-'}</span>,
    },
    {
      key: 'address',
      header: 'Location',
      className: 'max-w-[260px]',
      render: (outlet) => (
        <span className="flex items-center gap-1 text-muted-foreground truncate">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          {outlet.address || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (outlet) => (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          {outlet.phone || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (outlet) => <StatusBadge status={outlet.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (outlet) => (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionMenu
            actions={[
              {
                label: 'Edit',
                onClick: () => {
                  setEditingOutlet(outlet);
                  setShowForm(true);
                },
              },
              {
                label: 'Delete',
                onClick: () => setDeleteTarget(outlet),
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
        title="Outlet management"
        description={`${meta.total} outlet`}
        searchPlaceholder="Search outlets, locations, branches..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        primaryAction={{
          label: 'Add outlet',
          onClick: () => {
            setEditingOutlet(null);
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
        <OutletFilter
          type={typeFilter}
          branchId={branchFilter}
          isActive={statusFilter}
          onTypeChange={(value) => {
            setTypeFilter(value);
            setPage(1);
          }}
          onBranchChange={(value) => {
            setBranchFilter(value);
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
            data={data as OutletRow[]}
            selectable
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            getRowId={(row) => row.id}
            emptyMessage="No outlets found"
          />
          <div className="mt-4">
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <OutletForm
        open={showForm}
        mode={editingOutlet ? 'edit' : 'create'}
        outlet={editingOutlet}
        onClose={() => {
          setShowForm(false);
          setEditingOutlet(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete outlet <strong>{deleteTarget?.name}</strong>?
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
