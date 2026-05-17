'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, Filter, Loader2, Trash2 } from 'lucide-react';
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
import { getEmployeeColumns } from '@/components/employees/employee-columns';
import { EmployeeFilter } from '@/components/employees/employee-filter';
import { EmployeeForm } from '@/components/employees/employee-form';
import { EmployeeImportDialog } from '@/components/employees/employee-import-dialog';
import { useEmployees } from '@/hooks/use-employees';
import { useEmployeeMutations } from '@/hooks/use-employee-mutations';
import { exportEmployees } from '@/lib/employees';
import type { EmployeeDto, EmployeeQueryParams } from '@fieldapp/shared';

export default function EmployeesPage() {
  const router = useRouter();

  // Filter & pagination state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Dialog state
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Build query params
  const params: EmployeeQueryParams = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter || undefined,
    branchId: branchFilter || undefined,
    isActive: statusFilter || undefined,
  }), [page, search, roleFilter, branchFilter, statusFilter]);

  const { data, meta, loading, refetch } = useEmployees(params);
  const { create, update, remove, importFile } = useEmployeeMutations();

  const columns = useMemo(() => getEmployeeColumns({
    onEdit: (e) => { setEditingEmployee(e); setShowForm(true); },
    onView: (e) => router.push(`/employees/${e.id}`),
    onDelete: (e) => setDeleteTarget(e),
  }), [router]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setRoleFilter('');
    setBranchFilter('');
    setStatusFilter('');
    setPage(1);
  }, []);

  const handleFormSubmit = useCallback(async (formData: Record<string, unknown>) => {
    if (editingEmployee) {
      await update(editingEmployee.id, formData as any);
    } else {
      await create(formData as any);
    }
    refetch();
  }, [editingEmployee, create, update, refetch]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      refetch();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, remove, refetch]);

  const handleImportSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <PageWrapper>
      <PageToolbar
        title="Quản lý nhân viên"
        description={`${meta.total} nhân viên`}
        searchPlaceholder="Tìm kiếm nhân viên..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        primaryAction={{
          label: 'Thêm nhân viên',
          onClick: () => { setEditingEmployee(null); setShowForm(true); },
        }}
        secondaryActions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[13px]"
              onClick={() => setShowImport(true)}
            >
              <Upload className="w-3.5 h-3.5" />Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[13px]"
              onClick={() => exportEmployees(params)}
            >
              <Download className="w-3.5 h-3.5" />Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1.5 text-[13px] ${showFilter ? 'bg-[#0052cc]/10 text-[#0052cc] border-[#0052cc]' : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="w-3.5 h-3.5" />Bộ lọc
            </Button>
          </>
        }
      />

      {showFilter && (
        <EmployeeFilter
          role={roleFilter}
          branchId={branchFilter}
          isActive={statusFilter}
          onRoleChange={(v) => { setRoleFilter(v); setPage(1); }}
          onBranchChange={(v) => { setBranchFilter(v); setPage(1); }}
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
            selectable
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            getRowId={(row) => (row as EmployeeDto).id}
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
      <EmployeeForm
        open={showForm}
        mode={editingEmployee ? 'edit' : 'create'}
        employee={editingEmployee}
        onClose={() => { setShowForm(false); setEditingEmployee(null); }}
        onSubmit={handleFormSubmit}
      />

      {/* Import Dialog */}
      <EmployeeImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={importFile}
        onSuccess={handleImportSuccess}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên <strong>{deleteTarget?.name}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
