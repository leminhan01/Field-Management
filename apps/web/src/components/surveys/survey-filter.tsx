'use client';

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
import { SURVEY_STATUS_LABELS } from '@fieldapp/shared';

interface SurveyFilterProps {
  status?: string;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function SurveyFilter({ status, onStatusChange, onClear }: SurveyFilterProps) {
  const hasFilters = !!status;

  return (
    <div className="flex items-end gap-4 mb-4 p-4 bg-white rounded-lg border">
      <div className="space-y-1.5">
        <Label className="text-[12px] text-muted-foreground">Status</Label>
        <Select value={status || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] h-8 text-[13px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.entries(SURVEY_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
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
