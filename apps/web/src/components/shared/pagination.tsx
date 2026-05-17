'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift(-1);
    if (page + delta < totalPages - 1) range.push(-2);
    return [1, ...range, totalPages > 1 ? totalPages : []].flat().filter((v, i, a) => a.indexOf(v) === i && v !== 0);
  };

  const pages = totalPages <= 1 ? [1] : getVisiblePages();

  return (
    <div className={cn('flex items-center justify-between py-3', className)}>
      <p className="text-[12px] text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        {pages.map((p, i) =>
          p === -1 || p === -2 ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-xs">...</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              className="h-7 w-7 text-[12px]"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
