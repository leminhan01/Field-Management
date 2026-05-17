'use client';

import { X } from 'lucide-react';
import { BRANCH_TYPE_LABELS } from '@fieldapp/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BranchFilterProps {
  type?: string;
  isActive?: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function BranchFilter({
  type,
  isActive,
  onTypeChange,
  onStatusChange,
  onClear,
}: BranchFilterProps) {
  const hasFilters = type || isActive;

  return (
    <div className="flex items-end gap-4 mb-4 p-4 bg-white rounded-lg border">
      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Phân vùng</Label>
        <Select value={type || 'all'} onValueChange={(v) => onTypeChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[220px] h-8 text-[13px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(BRANCH_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Trạng thái</Label>
        <Select value={isActive || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] h-8 text-[13px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Hoạt động</SelectItem>
            <SelectItem value="false">Ngưng hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[13px] text-muted-foreground" onClick={onClear}>
          <X className="w-3.5 h-3.5" />Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
