'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { BRANCH_TYPE_LABELS } from '@fieldapp/shared';
import type { BranchDto } from '@fieldapp/shared';
import { extractBranchErrorMessage } from '@/lib/branches';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Branch name là bắt buộc')
    .min(2, 'Branch name phải có ít nhất 2 ký tự')
    .max(120, 'Branch name không được vượt quá 120 ký tự'),
  code: z
    .string()
    .trim()
    .min(1, 'Branch code is required')
    .min(2, 'Branch code must be at least 2 characters')
    .max(30, 'Branch code must not exceed 30 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Branch code can only contain letters, numbers, hyphens, or underscores'),
  address: z.string().trim().max(255, 'Address must not exceed 255 characters').optional().or(z.literal('')),
  type: z.string().min(1, 'Branch division is required'),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BranchFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  branch?: BranchDto | null;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function BranchForm({ open, mode, branch, onClose, onSubmit }: BranchFormProps) {
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
      type: 'OTHER',
      isActive: true,
    },
  });

  useEffect(() => {
    setServerError(null);

    if (mode === 'edit' && branch) {
      reset({
        name: branch.name,
        code: branch.code,
        address: branch.address || '',
        type: branch.type,
        isActive: branch.isActive,
      });
      return;
    }

    reset({
      name: '',
      code: '',
      address: '',
      type: 'OTHER',
      isActive: true,
    });
  }, [mode, branch, reset, open]);

  const selectedType = watch('type');

  const handleFormSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const payload: Record<string, unknown> = {
        ...data,
        code: data.code.toUpperCase(),
      };

      if (!payload.address) delete payload.address;
      if (mode === 'create') delete payload.isActive;

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const fallback = mode === 'create' ? 'Failed to create branch' : 'Failed to update branch';
      setServerError(extractBranchErrorMessage(err, fallback));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add new branch' : 'Edit branch'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Branch name *</Label>
              <Input {...register('name')} placeholder="Company A - Southern Branch" className="h-9 text-[13px]" />
              {errors.name && <p className="text-[12px] text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Branch code *</Label>
              <Input {...register('code')} placeholder="CN-MN" className="h-9 text-[13px] uppercase" />
              {errors.code && <p className="text-[12px] text-red-500">{errors.code.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Address</Label>
            <Textarea {...register('address')} placeholder="Enter branch address" className="min-h-[76px] text-[13px]" />
            {errors.address && <p className="text-[12px] text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Division *</Label>
              <Select value={selectedType || 'OTHER'} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRANCH_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-[12px] text-red-500">{errors.type.message}</p>}
            </div>

            {mode === 'edit' && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={watch('isActive') ? 'true' : 'false'}
                  onValueChange={(v) => setValue('isActive', v === 'true')}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

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
