'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getBranches } from '@/lib/employees';
import { ROLE_LABELS } from '@fieldapp/shared';
import type { EmployeeDto } from '@fieldapp/shared';

const formSchema = z.object({
  name: z.string().min(1, 'Tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  branchId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  employee?: EmployeeDto | null;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function EmployeeForm({ open, mode, employee, onClose, onSubmit }: EmployeeFormProps) {
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'STAFF',
      branchId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      getBranches().then(setBranches).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (mode === 'edit' && employee) {
      reset({
        name: employee.name,
        email: employee.email,
        password: '',
        phone: employee.phone || '',
        role: employee.role,
        branchId: employee.branchId || '',
        isActive: employee.isActive,
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF',
        branchId: '',
        isActive: true,
      });
    }
  }, [mode, employee, reset, open]);

  const selectedRole = watch('role');
  const selectedBranch = watch('branchId');

  const handleFormSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...data };
      if (!payload.phone) delete payload.phone;
      if (!payload.branchId) delete payload.branchId;
      if (!payload.role) delete payload.role;
      if (mode === 'edit') {
        delete payload.password;
        delete (payload as any).isActive;
        if (employee) payload.isActive = data.isActive;
      } else {
        // Create mode: password required
        if (!payload.password) {
          setSubmitting(false);
          return;
        }
        delete payload.isActive;
      }
      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Họ tên *</Label>
            <Input {...register('name')} placeholder="Nhập họ tên" className="h-9 text-[13px]" />
            {errors.name && <p className="text-[12px] text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input {...register('email')} type="email" placeholder="email@example.com" className="h-9 text-[13px]" />
            {errors.email && <p className="text-[12px] text-red-500">{errors.email.message}</p>}
          </div>

          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label>Mật khẩu *</Label>
              <Input {...register('password')} type="password" placeholder="Tối thiểu 6 ký tự" className="h-9 text-[13px]" />
              {errors.password && <p className="text-[12px] text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Số điện thoại</Label>
            <Input {...register('phone')} placeholder="0901 234 567" className="h-9 text-[13px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Vai trò</Label>
              <Select value={selectedRole || 'STAFF'} onValueChange={(v) => setValue('role', v)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Chi nhánh</Label>
              <Select value={selectedBranch || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === 'edit' && employee && (
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={watch('isActive') ? 'true' : 'false'}
                onValueChange={(v) => setValue('isActive', v === 'true')}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="bg-[#0052cc] hover:bg-[#003d9b]">
              {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {mode === 'create' ? 'Thêm' : 'Lưu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
