'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage, getBranches } from '@/lib/employees';
import { getPositions } from '@/lib/positions';
import { ROLE_LABELS } from '@fieldapp/shared';
import type { EmployeeDto, PositionDto } from '@fieldapp/shared';

const MAX_AVATAR_SIZE = 10 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không đúng định dạng')
    .max(255, 'Email không được vượt quá 255 ký tự'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[0-9\s+()-]*$/, 'Số điện thoại không hợp lệ')
    .min(9, 'Số điện thoại phải có ít nhất 9 chữ số')
    .max(15, 'Số điện thoại không được vượt quá 15 ký tự')
    .optional()
    .or(z.literal('')),
  role: z.string().optional(),
  positionId: z.string().optional(),
  branchId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  employee?: EmployeeDto | null;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>, avatarFile?: File) => Promise<void>;
}

export function EmployeeForm({ open, mode, employee, onClose, onSubmit }: EmployeeFormProps) {
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [positions, setPositions] = useState<PositionDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
      positionId: '',
      branchId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      getBranches().then(setBranches).catch(() => {});
      getPositions({ page: 1, limit: 100 })
        .then((result) => setPositions(result.data))
        .catch(() => {});
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
        positionId: employee.positionId || '',
        branchId: employee.branchId || '',
        isActive: employee.isActive,
      });
      setAvatarPreview(employee.avatar || null);
      setAvatarFile(null);
    } else if (mode === 'create') {
      reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF',
        positionId: '',
        branchId: '',
        isActive: true,
      });
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [mode, employee, reset, open]);

  const selectedRole = watch('role');
  const selectedPosition = watch('positionId');
  const selectedBranch = watch('branchId');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setServerError(null);

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setServerError('Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WebP');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setServerError('Ảnh đại diện không được vượt quá 10MB');
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(-2).toUpperCase();

  const handleFormSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const payload: Record<string, unknown> = { ...data };
      if (!payload.phone) delete payload.phone;
      if (!payload.branchId) delete payload.branchId;
      if (!payload.positionId) delete payload.positionId;
      if (!payload.role) delete payload.role;
      if (mode === 'edit') {
        delete payload.password;
        delete (payload as any).isActive;
        if (employee) payload.isActive = data.isActive;
      } else {
        if (!payload.password) {
          setServerError('Mật khẩu là bắt buộc khi thêm nhân viên');
          return;
        }
        delete payload.isActive;
      }
      await onSubmit(payload, avatarFile || undefined);
      onClose();
    } catch (err) {
      const fallback = mode === 'create' ? 'Thêm nhân viên thất bại' : 'Cập nhật nhân viên thất bại';
      setServerError(extractErrorMessage(err, fallback));
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
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-16 h-16 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Avatar" />
                ) : (
                  <AvatarFallback
                    className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-[18px] font-bold"
                  >
                    {watch('name') ? initials(watch('name')) : '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="text-[12px] text-muted-foreground">
              <p>Nhấn để {avatarPreview ? 'đổi' : 'tải lên'} ảnh đại diện</p>
              <p>JPG, PNG hoặc WebP. Tối đa 10MB</p>
              {avatarPreview && avatarFile && (
                <button
                  type="button"
                  className="text-red-500 hover:underline mt-1"
                  onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                >
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>

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
            {errors.phone && <p className="text-[12px] text-red-500">{errors.phone.message}</p>}
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
              <Label>Chức vụ</Label>
              <Select
                value={selectedPosition || 'none'}
                onValueChange={(v) => setValue('positionId', v === 'none' ? '' : v)}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
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

          {serverError && (
            <div className="whitespace-pre-line rounded-md bg-red-50 border border-red-200 p-3 text-[13px] text-red-700">
              {serverError}
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
