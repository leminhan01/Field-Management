'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface EmployeeFilterProps {
  role?: string;
  branchId?: string;
  isActive?: string;
  onRoleChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function EmployeeFilter({
  role,
  branchId,
  isActive,
  onRoleChange,
  onBranchChange,
  onStatusChange,
  onClear,
}: EmployeeFilterProps) {
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    getBranches().then(setBranches).catch(() => {});
  }, []);

  const hasFilters = role || branchId || isActive;

  return (
    <div className="flex items-end gap-4 mb-4 p-4 bg-white rounded-lg border">
      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Role</Label>
        <Select value={role || 'all'} onValueChange={(v) => onRoleChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] h-8 text-[13px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Branch</Label>
        <Select value={branchId || 'all'} onValueChange={(v) => onBranchChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[200px] h-8 text-[13px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Status</Label>
        <Select value={isActive || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-8 text-[13px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[13px] text-muted-foreground" onClick={onClear}>
          <X className="w-3.5 h-3.5" />Clear filters
        </Button>
      )}
    </div>
  );
}
