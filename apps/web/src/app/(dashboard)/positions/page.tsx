'use client';

import { useMemo, useState } from 'react';
import { Edit, Loader2, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Role, type PositionDto } from '@fieldapp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Pagination } from '@/components/shared/pagination';
import { createPosition, deletePosition, updatePosition } from '@/lib/positions';
import { extractErrorMessage } from '@/lib/employees';
import { usePositions } from '@/hooks/use-positions';

interface PositionFormState {
  name: string;
  code: string;
  description: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
}

type PositionTableRow = PositionDto & Record<string, unknown>;

const emptyForm: PositionFormState = {
  name: '',
  code: '',
  description: '',
  role: Role.STAFF,
  permissions: [],
  isActive: true,
};

export default function PositionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PositionDto | null>(null);
  const [form, setForm] = useState<PositionFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PositionDto | null>(null);

  const params = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
  }), [page, search]);

  const { data, meta, permissions, loading, refetch } = usePositions(params);

  const permissionGroups = useMemo(() => {
    return permissions.reduce<Record<string, typeof permissions>>((groups, permission) => {
      groups[permission.group] = groups[permission.group] || [];
      groups[permission.group].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (position: PositionDto) => {
    setEditing(position);
    setForm({
      name: position.name,
      code: position.code,
      description: position.description || '',
      role: position.role as Role,
      permissions: position.permissions,
      isActive: position.isActive,
    });
    setOpen(true);
  };

  const togglePermission = (key: string) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter((permission) => permission !== key)
        : [...current.permissions, key],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
      };
      if (editing) {
        await updatePosition(editing.id, payload);
        toast.success('Cap nhat chuc vu thanh cong');
      } else {
        await createPosition(payload);
        toast.success('Tao chuc vu thanh cong');
      }
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Luu chuc vu that bai'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePosition(deleteTarget.id);
      toast.success('Xoa chuc vu thanh cong');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Xoa chuc vu that bai'));
    }
  };

  const columns: Column<PositionTableRow>[] = [
    {
      key: 'name',
      header: 'Chuc vu',
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.code}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge variant="outline">{row.role}</Badge>,
    },
    {
      key: 'permissions',
      header: 'Quyen',
      render: (row) => (
        <span className="text-muted-foreground">{row.permissions.length} quyen</span>
      ),
    },
    {
      key: 'users',
      header: 'Nhan vien',
      render: (row) => row._count?.users || 0,
    },
    {
      key: 'status',
      header: 'Trang thai',
      render: (row) => (
        <Badge variant={row.isActive ? 'default' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={row.isSystem || (row._count?.users || 0) > 0}
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageToolbar
        title="Quan ly chuc vu"
        description={`${meta.total} chuc vu`}
        searchPlaceholder="Tim kiem chuc vu..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        primaryAction={{ label: 'Them chuc vu', onClick: openCreate }}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={data as PositionTableRow[]} />
          <div className="mt-4">
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Cap nhat chuc vu' : 'Them chuc vu'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên chức vụ</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ma chuc vu</Label>
              <Input
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                placeholder="FIELD_SUPERVISOR"
              />
            </div>
            <div className="space-y-2">
              <Label>Role he thong</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <Label>Dang hoat dong</Label>
                <div className="text-xs text-muted-foreground">Cho phep gan cho nhan vien</div>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Mo ta</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Phan quyen su dung
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(permissionGroups).map(([group, items]) => (
                <div key={group} className="rounded-md border p-3">
                  <div className="mb-2 text-sm font-medium">{group}</div>
                  <div className="space-y-2">
                    {items.map((permission) => (
                      <label key={permission.key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.permissions.includes(permission.key)}
                          onCheckedChange={() => togglePermission(permission.key)}
                        />
                        <span>{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Huy</Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.name || !form.code}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Luu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(value) => !value && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Xac nhan xoa chuc vu</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Chuc vu {deleteTarget?.name} se bi xoa mem neu khong con nhan vien dang su dung.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Huy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xoa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
