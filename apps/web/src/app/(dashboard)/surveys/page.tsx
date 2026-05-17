'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ClipboardList, Users, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActionMenu, type ActionItem } from '@/components/shared/action-menu';

interface Survey {
  id: number;
  title: string;
  questions: number;
  responses: number;
  targetBranches: number;
  status: string;
  createdBy: string;
  createdAt: string;
  endDate: string;
}

const mockSurveys: Survey[] = [
  { id: 1, title: 'Khai sat muc do hai long KH tai cua hang', questions: 12, responses: 45, targetBranches: 8, status: 'Active', createdBy: 'Admin', createdAt: '01/05/2026', endDate: '31/05/2026' },
  { id: 2, title: 'Danh gia trung bay san pham BB', questions: 8, responses: 32, targetBranches: 12, status: 'Active', createdBy: 'Manager', createdAt: '05/05/2026', endDate: '20/05/2026' },
  { id: 3, title: 'Khai sat hieu qua sampling', questions: 6, responses: 18, targetBranches: 5, status: 'Draft', createdBy: 'Admin', createdAt: '10/05/2026', endDate: '-' },
  { id: 4, title: 'Feedback thiet bi tai diem ban', questions: 10, responses: 56, targetBranches: 15, status: 'Completed', createdBy: 'Admin', createdAt: '01/04/2026', endDate: '30/04/2026' },
  { id: 5, title: 'Danh gia nhan vien thuc hien task', questions: 15, responses: 0, targetBranches: 10, status: 'Pending', createdBy: 'Manager', createdAt: '20/05/2026', endDate: '30/05/2026' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function SurveysPage() {
  const [search, setSearch] = useState('');

  const filtered = mockSurveys.filter((s) => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.status.toLowerCase().includes(q);
  });

  const actions: ActionItem[] = [
    { label: 'Edit', onClick: () => {} },
    { label: 'View Detail', onClick: () => {} },
    { label: 'Delete', onClick: () => {}, variant: 'destructive' },
  ];

  return (
    <PageWrapper>
      <PageToolbar
        searchPlaceholder="Search surveys..."
        searchValue={search}
        onSearchChange={setSearch}
        primaryAction={{ label: 'Create Survey', onClick: () => {} }}
        secondaryActions={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Filter className="w-3.5 h-3.5" />Filter</Button>
        }
      />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {filtered.map((survey) => {
          const ratePercent = Math.round((survey.responses / (survey.targetBranches * 5)) * 100);
          return (
            <motion.div key={survey.id} variants={itemVariants}>
              <Card className="border hover:shadow-md hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-[14px] font-semibold">{survey.title}</h4>
                        <StatusBadge status={survey.status} />
                      </div>
                      <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />{survey.questions} questions</span>
                        <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" />{survey.responses} responses</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{survey.targetBranches} branches</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{survey.createdAt} - {survey.endDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {survey.responses > 0 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><BarChart3 className="w-4 h-4" /></Button>
                      )}
                      <ActionMenu actions={actions} />
                    </div>
                  </div>
                  {survey.responses > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Response rate:</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ratePercent)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground">{ratePercent}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </PageWrapper>
  );
}
