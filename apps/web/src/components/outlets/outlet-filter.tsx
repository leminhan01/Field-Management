'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { OUTLET_TYPE_LABELS } from '@fieldapp/shared';
import type { BranchOptionDto } from '@fieldapp/shared';
import { getBranchOptions } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OutletFilterProps {
  type?: string;
  branchId?: string;
  isActive?: string;
  onTypeChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function OutletFilter({
  type,
  branchId,
  isActive,
  onTypeChange,
  onBranchChange,
  onStatusChange,
  onClear,
}: OutletFilterProps) {
  const [branches, setBranches] = useState<BranchOptionDto[]>([]);
  const hasFilters = type || branchId || isActive;

  useEffect(() => {
    getBranchOptions().then(setBranches).catch(() => {});
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4 p-4 bg-white rounded-lg border">
      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Loai outlet</Label>
        <Select value={type || 'all'} onValueChange={(v) => onTypeChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[190px] h-8 text-[13px]">
            <SelectValue placeholder="Tat ca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            {Object.entries(OUTLET_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Chi nhanh quan ly</Label>
        <Select value={branchId || 'all'} onValueChange={(v) => onBranchChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[220px] h-8 text-[13px]">
            <SelectValue placeholder="Tat ca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Trang thai</Label>
        <Select value={isActive || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[170px] h-8 text-[13px]">
            <SelectValue placeholder="Tat ca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            <SelectItem value="true">Hoat dong</SelectItem>
            <SelectItem value="false">Ngung hoat dong</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[13px] text-muted-foreground" onClick={onClear}>
          <X className="w-3.5 h-3.5" />Xoa bo loc
        </Button>
      )}
    </div>
  );
}
