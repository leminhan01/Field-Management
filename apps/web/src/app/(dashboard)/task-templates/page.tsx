'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Camera, Clock, Copy, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';

interface TaskTemplate {
  id: number;
  name: string;
  type: string;
  category: string;
  checklistCount: number;
  photoRequired: boolean;
  estimatedTime: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const mockTemplates: TaskTemplate[] = [
  { id: 1, name: 'Kiem tra trung bay BB', type: 'Regular', category: 'BB', checklistCount: 12, photoRequired: true, estimatedTime: '45 min', status: 'Active', createdBy: 'Admin', createdAt: '01/03/2025' },
  { id: 2, name: 'Sampling san pham moi', type: 'Regular', category: 'BG', checklistCount: 8, photoRequired: true, estimatedTime: '30 min', status: 'Active', createdBy: 'Admin', createdAt: '15/03/2025' },
  { id: 3, name: 'Kiem tra camera', type: 'Device', category: 'BB', checklistCount: 6, photoRequired: false, estimatedTime: '20 min', status: 'Active', createdBy: 'Admin', createdAt: '20/04/2025' },
  { id: 4, name: 'Setup standee quang ba', type: 'Regular', category: 'Promotion', checklistCount: 10, photoRequired: true, estimatedTime: '60 min', status: 'Active', createdBy: 'Manager', createdAt: '05/05/2025' },
  { id: 5, name: 'Bao tri thiet bi POS', type: 'Device', category: 'BG', checklistCount: 5, photoRequired: false, estimatedTime: '30 min', status: 'Draft', createdBy: 'Admin', createdAt: '10/05/2025' },
  { id: 6, name: 'Khai sat khach hang', type: 'Survey', category: 'BB', checklistCount: 15, photoRequired: false, estimatedTime: '25 min', status: 'Active', createdBy: 'Manager', createdAt: '12/05/2025' },
];

const typeColors: Record<string, string> = {
  Regular: 'bg-blue-50 text-blue-700 border-blue-200',
  Device: 'bg-purple-50 text-purple-700 border-purple-200',
  Survey: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const categoryColors: Record<string, string> = {
  BB: 'bg-orange-50 text-orange-700 border-orange-200',
  BG: 'bg-teal-50 text-teal-700 border-teal-200',
  Promotion: 'bg-pink-50 text-pink-700 border-pink-200',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
};

export default function TaskTemplatesPage() {
  const [search, setSearch] = useState('');

  const filtered = mockTemplates.filter((t) => {
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search templates..."
        searchValue={search}
        onSearchChange={setSearch}
        primaryAction={{ label: 'Create Template', onClick: () => {} }}
        secondaryActions={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Filter className="w-3.5 h-3.5" />Filter</Button>
        }
      />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tmpl) => {
          const actions: ActionItem[] = [
            { label: 'Edit', onClick: () => {} },
            { label: 'View', onClick: () => {} },
            { label: 'Duplicate', onClick: () => {}, icon: <Copy className="w-4 h-4" /> },
            { label: 'Delete', onClick: () => {}, variant: 'destructive' },
          ];
          return (
            <motion.div key={tmpl.id} variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
              <Card className="border hover:shadow-md hover:border-primary/30 transition-all h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-[14px] font-semibold mb-1">{tmpl.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeColors[tmpl.type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>{tmpl.type}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${categoryColors[tmpl.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>{tmpl.category}</span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionMenu actions={actions} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" />{tmpl.checklistCount} items</span>
                    <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5" />{tmpl.photoRequired ? 'Required' : 'Optional'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tmpl.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/50">
                    <span>By {tmpl.createdBy}</span>
                    <span>{tmpl.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </PageWrapper>
  );
}
