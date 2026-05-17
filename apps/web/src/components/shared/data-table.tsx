'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
  headClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
 getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  getRowId,
  onRowClick,
  className,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const allIds = getRowId ? data.map(getRowId) : [];
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const toggleAll = () => {
    if (!onSelectChange || !getRowId) return;
    onSelectChange(allSelected ? [] : allIds);
  };

  const toggleRow = (id: string) => {
    if (!onSelectChange) return;
    onSelectChange(allSelected ? selectedIds.filter((i) => i !== id) : [...selectedIds.filter((i) => allIds.includes(i)), id]);
  };

  return (
    <Card className={cn('border shadow-sm', className)}>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-10 pl-4">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={col.key} className={cn('text-[12px] font-semibold text-muted-foreground', col.headClassName)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground text-[13px]"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId ? getRowId(row) : String(index);
                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      'cursor-pointer transition-colors',
                      onRowClick && 'hover:bg-muted/50',
                      selectedIds.includes(rowId) && 'bg-primary/5',
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <TableCell className="w-10 pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(rowId)}
                          onCheckedChange={() => toggleRow(rowId)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key} className={cn('text-[13px]', col.className)}>
                        {col.render(row, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
