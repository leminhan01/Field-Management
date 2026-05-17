'use client';

import { ReactNode } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PageToolbarProps {
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  secondaryActions?: ReactNode;
  className?: string;
}

export function PageToolbar({
  title,
  description,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  primaryAction,
  secondaryActions,
  className,
}: PageToolbarProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Page header — title + description left, action button right */}
      <div className="flex justify-between items-end mb-5">
        <div>
          {title && (
            <h1 className="text-[22px] font-semibold text-[#191b23] leading-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-[14px] text-[#434654] mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {secondaryActions}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="h-9 gap-2 bg-[#0052cc] hover:bg-[#003d9b] text-white shadow-md"
            >
              {primaryAction.icon || <Plus className="w-4 h-4" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Search row */}
      {onSearchChange !== undefined && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737685]" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 text-[13px] bg-[#f3f3fd] border-[#e0e1ec] focus:ring-[#0052cc]/20"
          />
        </div>
      )}
    </div>
  );
}
