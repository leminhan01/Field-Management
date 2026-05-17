'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-[#0052cc]',
  className,
}: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.15 } }}>
      <div
        className={cn(
          'bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5 transition-shadow hover:shadow-[0px_6px_16px_rgba(0,0,0,0.08)]',
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
              {title}
            </p>
            <p className="text-[28px] font-bold text-[#191b23] tracking-tight leading-none">
              {value}
            </p>
            {change && (
              <p
                className={cn(
                  'text-[12px] font-medium',
                  changeType === 'positive' && 'text-emerald-600',
                  changeType === 'negative' && 'text-red-500',
                  changeType === 'neutral' && 'text-[#434654]/60',
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              iconColor === 'text-[#0052cc]' && 'bg-[#e8edfb]',
              iconColor === 'text-blue-600' && 'bg-[#e8edfb]',
              iconColor === 'text-emerald-600' && 'bg-emerald-50',
              iconColor === 'text-amber-600' && 'bg-amber-50',
              iconColor === 'text-red-500' && 'bg-red-50',
            )}
          >
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
