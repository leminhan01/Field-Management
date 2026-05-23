'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { OUTLET_TYPE_LABELS } from '@fieldapp/shared';
import type { BranchOptionDto, OutletDto } from '@fieldapp/shared';
import { getBranchOptions } from '@/lib/branches';
import { extractOutletErrorMessage } from '@/lib/outlets';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Outlet name must be at least 2 characters').max(120, 'Outlet name is too long'),
  code: z
    .string()
    .trim()
    .min(2, 'Outlet code must be at least 2 characters')
    .max(30, 'Outlet code is too long')
    .regex(/^[A-Z0-9_-]+$/i, 'Outlet code can only contain letters, numbers, hyphens, or underscores'),
  address: z.string().trim().max(255, 'Address is too long').optional().or(z.literal('')),
  phone: z.string().trim().max(30, 'Phone number is too long').optional().or(z.literal('')),
  type: z.string().min(1, 'Outlet type is required'),
  brand: z.string().trim().max(80, 'Brand is too long').optional().or(z.literal('')),
  branchId: z.string().min(1, 'Managing branch is required'),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OutletFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  outlet?: OutletDto | null;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function OutletForm({ open, mode, outlet, onClose, onSubmit }: OutletFormProps) {
  const [branches, setBranches] = useState<BranchOptionDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      code: '',
      address: '',
      phone: '',
      type: 'OTHER',
      brand: '',
      branchId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      getBranchOptions().then(setBranches).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    setServerError(null);

    if (mode === 'edit' && outlet) {
      reset({
        name: outlet.name,
        code: outlet.code,
        address: outlet.address || '',
        phone: outlet.phone || '',
        type: outlet.type,
        brand: outlet.brand || '',
        branchId: outlet.branchId,
        isActive: outlet.isActive,
      });
      return;
    }

    reset({
      name: '',
      code: '',
      address: '',
      phone: '',
      type: 'OTHER',
      brand: '',
      branchId: '',
      isActive: true,
    });
  }, [mode, outlet, reset, open]);

  const selectedType = watch('type');
  const selectedBranch = watch('branchId');

  const handleFormSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const payload: Record<string, unknown> = {
        ...data,
        code: data.code.toUpperCase(),
      };

      if (!payload.address) delete payload.address;
      if (!payload.phone) delete payload.phone;
      if (!payload.brand) delete payload.brand;
      if (mode === 'create') delete payload.isActive;

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const fallback = mode === 'create' ? 'Failed to create outlet' : 'Failed to update outlet';
      setServerError(extractOutletErrorMessage(err, fallback));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add new outlet' : 'Edit outlet'}</DialogTitle>
          <DialogDescription className="sr-only">
            Enter outlet information and its managing branch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Outlet name *</Label>
              <Input {...register('name')} placeholder="Outlet A" className="h-9 text-[13px]" />
              {errors.name && <p className="text-[12px] text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Outlet code *</Label>
              <Input {...register('code')} placeholder="OUTLET-A" className="h-9 text-[13px] uppercase" />
              {errors.code && <p className="text-[12px] text-red-500">{errors.code.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type outlet *</Label>
              <Select value={selectedType || 'OTHER'} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OUTLET_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-[12px] text-red-500">{errors.type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Managing branch *</Label>
              <Select value={selectedBranch || 'none'} onValueChange={(v) => v !== 'none' && setValue('branchId', v)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Select branch</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branchId && <p className="text-[12px] text-red-500">{errors.branchId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Input {...register('brand')} placeholder="Brand A" className="h-9 text-[13px]" />
              {errors.brand && <p className="text-[12px] text-red-500">{errors.brand.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input {...register('phone')} placeholder="028 1234 5678" className="h-9 text-[13px]" />
              {errors.phone && <p className="text-[12px] text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Address</Label>
            <Textarea {...register('address')} placeholder="Nhap dia diem outlet" className="min-h-[76px] text-[13px]" />
            {errors.address && <p className="text-[12px] text-red-500">{errors.address.message}</p>}
          </div>

          {mode === 'edit' && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch('isActive') ? 'true' : 'false'}
                onValueChange={(v) => setValue('isActive', v === 'true')}
              >
                <SelectTrigger className="w-[200px] h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
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
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="bg-[#0052cc] hover:bg-[#003d9b]">
              {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {mode === 'create' ? 'Add' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
