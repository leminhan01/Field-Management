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
        toast.success('Cap nhat outlet thanh cong');
      } else {
        await create(formData as unknown as CreateOutletInput);
        toast.success('Them outlet thanh cong');
      }

      refetch();
    } catch (err) {
      const msg = extractOutletErrorMessage(
        err,
        editingOutlet ? 'Cap nhat outlet that bai' : 'Them outlet that bai',
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
      toast.success(`Da xoa outlet ${deleteTarget.name}`);
      refetch();
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractOutletErrorMessage(err, 'Xoa outlet that bai'));
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
      header: 'Chi nhanh quan ly',
      render: (outlet) => <span className="text-muted-foreground">{outlet.branch.name}</span>,
    },
    {
      key: 'type',
      header: 'Loai',
      render: (outlet) => <TypeBadge type={OUTLET_TYPE_LABELS[outlet.type] || outlet.type} />,
    },
    {
      key: 'brand',
      header: 'Thuong hieu',
      render: (outlet) => <span className="text-muted-foreground">{outlet.brand || '-'}</span>,
    },
    {
      key: 'address',
      header: 'Dia diem',
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
      header: 'Lien he',
      render: (outlet) => (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          {outlet.phone || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trang thai',
      render: (outlet) => <StatusBadge status={outlet.isActive ? 'Hoat dong' : 'Ngung hoat dong'} />,
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
                label: 'Chinh sua',
                onClick: () => {
                  setEditingOutlet(outlet);
                  setShowForm(true);
                },
              },
              {
                label: 'Xoa',
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
        title="Quan ly outlet"
        description={`${meta.total} outlet`}
        searchPlaceholder="Tim kiem outlet, dia diem, chi nhanh..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        primaryAction={{
          label: 'Them outlet',
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
            <Filter className="w-3.5 h-3.5" />Bo loc
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
            emptyMessage="Khong co outlet"
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
            <DialogTitle>Xac nhan xoa</DialogTitle>
            <DialogDescription>
              Ban co chac chan muon xoa outlet <strong>{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Huy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              <Trash2 className="w-4 h-4 mr-1" />
              Xoa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
