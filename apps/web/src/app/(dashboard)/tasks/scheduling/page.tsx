'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageWrapper } from '@/components/shared/page-wrapper';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const scheduleData: Record<string, { branch: string; task: string; assignee: string; time: string; type: string }[]> = {
  '2026-05-11': [
    { branch: 'Lotte Mart Q7', task: 'Kiem tra trung bay', assignee: 'Nguyen Van An', time: '08:00 - 10:00', type: 'BB' },
    { branch: 'Restaurant B', task: 'Check Device', assignee: 'Dang Minh Quang', time: '09:00 - 17:00', type: 'Device' },
  ],
  '2026-05-12': [
    { branch: 'Coopmart Tan Dinh', task: 'Sampling san pham', assignee: 'Tran Thi Bich', time: '09:00 - 12:00', type: 'BG' },
  ],
  '2026-05-13': [
    { branch: 'AEON Binh Tan', task: 'Kiem tra camera', assignee: 'Le Minh Chau', time: '08:00 - 18:00', type: 'Device' },
    { branch: 'WinMart Q1', task: 'Bao cao BG', assignee: 'Pham Thi Dung', time: '14:00 - 16:00', type: 'BG' },
    { branch: 'Restaurant A', task: 'Cham soc KH VIP', assignee: 'Vo Thi Phuong', time: '10:00 - 12:00', type: 'BB' },
  ],
  '2026-05-14': [
    { branch: 'GO! Big C', task: 'Setup standee', assignee: 'Hoang Van Em', time: '08:00 - 11:00', type: 'Promotion' },
    { branch: 'Lotte Mart Q7', task: 'Kiem tra POS', assignee: 'Nguyen Van An', time: '13:00 - 15:00', type: 'BB' },
  ],
  '2026-05-15': [
    { branch: 'Restaurant B', task: 'Bao tri thiet bi', assignee: 'Dang Minh Quang', time: '09:00 - 12:00', type: 'Device' },
  ],
};

const typeColors: Record<string, string> = {
  BB: 'bg-orange-100 text-orange-700 border-orange-200',
  BG: 'bg-teal-100 text-teal-700 border-teal-200',
  Device: 'bg-purple-100 text-purple-700 border-purple-200',
  Promotion: 'bg-pink-100 text-pink-700 border-pink-200',
};

function getWeekDates(): Date[] {
  const today = new Date(2026, 4, 14);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const taskVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

export default function SchedulingPage() {
  const weekDates = getWeekDates();
  const [selectedDate, setSelectedDate] = useState('2026-05-14');

  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return (
    <PageWrapper>
      <Card className="border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1.5 text-[13px]"><Plus className="w-3.5 h-3.5" />Assign Task</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]"><Filter className="w-3.5 h-3.5" />Filter</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-[14px] font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              Week of {weekDates[0].toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {weekDates[6].toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 divide-x divide-border/30">
          {weekDates.map((date) => {
            const dateStr = formatDate(date);
            const tasks = scheduleData[dateStr] || [];
            const isToday = dateStr === '2026-05-14';
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[300px] p-2 cursor-pointer transition-colors ${isSelected ? 'bg-primary/[0.03]' : 'hover:bg-muted/30'}`}
              >
                {/* Date Header */}
                <div className={`text-center pb-2 mb-2 border-b-2 ${isToday ? 'border-primary' : 'border-transparent'}`}>
                  <div className="text-[11px] text-muted-foreground font-medium uppercase">
                    {daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                  </div>
                  <div className={`text-[18px] font-bold ${isToday ? 'text-primary' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-1.5">
                  {tasks.map((task, i) => (
                    <motion.div
                      key={i}
                      variants={taskVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                      className="p-1.5 rounded-md border border-border/50 bg-card shadow-xs hover:shadow-sm transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${typeColors[task.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {task.type}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium leading-tight mb-0.5">{task.task}</p>
                      <p className="text-[10px] text-muted-foreground">{task.branch}</p>
                      <p className="text-[10px] text-muted-foreground">{task.time}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageWrapper>
  );
}
