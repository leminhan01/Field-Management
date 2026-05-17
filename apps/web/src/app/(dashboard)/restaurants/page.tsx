'use client';

import { useState } from 'react';
import { MapPin, Users, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable, type Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  brand: string;
  region: string;
  staffCount: number;
  status: string;
  [key: string]: unknown;
}

const mockRestaurants: Restaurant[] = [
  { id: 1, name: 'Restaurant A', address: '78 Vo Van Tan, Quan 3', phone: '028 6789 012', brand: 'Brand A', region: 'HCM - Quan 3', staffCount: 4, status: 'Active' },
  { id: 2, name: 'Restaurant B', address: '56 Phan Xich Long, Phu Nhuan', phone: '028 7890 123', brand: 'Brand B', region: 'HCM - Phu Nhuan', staffCount: 4, status: 'Active' },
  { id: 3, name: 'Restaurant C', address: '90 Le Van Sy, Binh Thanh', phone: '028 8901 234', brand: 'Brand A', region: 'HCM - Binh Thanh', staffCount: 3, status: 'Inactive' },
];

const columns: Column<Restaurant>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: 'brand', header: 'Brand', render: (r) => <span className="text-muted-foreground text-[12px] bg-muted px-2 py-0.5 rounded-full">{r.brand}</span> },
  { key: 'address', header: 'Address', render: (r) => <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{r.address}</span> },
  { key: 'region', header: 'Region', render: (r) => <span className="text-muted-foreground">{r.region}</span> },
  { key: 'staffCount', header: 'Staff', render: (r) => <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3.5 h-3.5" />{r.staffCount}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'actions', header: '', className: 'w-10', render: (r) => <RowActions id={r.id} /> },
];

function RowActions({ id }: { id: number }) {
  const actions: ActionItem[] = [
    { label: 'Edit', onClick: () => {} },
    { label: 'View', onClick: () => {} },
    { label: 'Delete', onClick: () => {}, variant: 'destructive' },
  ];
  return <ActionMenu actions={actions} />;
}

export default function RestaurantsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockRestaurants.filter((r) => {
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q);
  });

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search restaurants..."
        searchValue={search}
        onSearchChange={setSearch}
        primaryAction={{ label: 'Add Restaurant', onClick: () => {} }}
        secondaryActions={
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Download className="w-3.5 h-3.5" />Export</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Filter className="w-3.5 h-3.5" />Filter</Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={filtered}
        selectable
        getRowId={(r) => String(r.id)}
      />
    </PageWrapper>
  );
}
