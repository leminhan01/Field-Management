'use client';

import { motion } from 'framer-motion';
import {
  Users,
  ClipboardCheck,
  Store,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Bell,
  Star,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { StatusBadge } from '@/components/shared/status-badge';

const statsData = [
  {
    title: 'Total Employees',
    value: '128',
    change: '+12% vs last month',
    changeType: 'positive' as const,
    icon: Users,
    iconColor: 'text-[#0052cc]',
    bgClass: 'bg-[#e8edfb]',
  },
  {
    title: 'Active Tasks',
    value: '54',
    change: '+8% vs last month',
    changeType: 'positive' as const,
    icon: ClipboardCheck,
    iconColor: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
  },
  {
    title: 'Stores Managed',
    value: '36',
    change: '+3% vs last month',
    changeType: 'positive' as const,
    icon: Store,
    iconColor: 'text-amber-600',
    bgClass: 'bg-amber-50',
  },
  {
    title: 'Completion Rate',
    value: '87%',
    change: '-2% vs last month',
    changeType: 'negative' as const,
    icon: TrendingUp,
    iconColor: 'text-red-500',
    bgClass: 'bg-red-50',
  },
];

const taskStatusData = [
  { status: 'Completed', count: 45, percent: 56, color: 'bg-emerald-500' },
  { status: 'In Progress', count: 24, percent: 30, color: 'bg-blue-500' },
  { status: 'Pending', count: 8, percent: 10, color: 'bg-amber-500' },
  { status: 'Overdue', count: 3, percent: 4, color: 'bg-red-500' },
];

const recentTasks = [
  { id: 1, name: 'Kiem tra trung bay - Lotte Mart Q7', assignee: 'Nguyen Van A', branch: 'Lotte Mart Q7', status: 'In Progress', dueDate: '14/05/2026' },
  { id: 2, name: 'Sampling san pham moi - Coopmart', assignee: 'Tran Thi B', branch: 'Coopmart Tan Dinh', status: 'Completed', dueDate: '13/05/2026' },
  { id: 3, name: 'Kiem tra camera - AEON Binh Tan', assignee: 'Le Minh C', branch: 'AEON Binh Tan', status: 'Pending', dueDate: '15/05/2026' },
  { id: 4, name: 'Bao cao BG thang 5 - WinMart', assignee: 'Pham Thi D', branch: 'WinMart Q1', status: 'Completed', dueDate: '12/05/2026' },
  { id: 5, name: 'Setup standee - GO! Big C', assignee: 'Hoang Van E', branch: 'GO! Big C Dong Nai', status: 'Rejected', dueDate: '11/05/2026' },
];

const topEmployees = [
  { name: 'Nguyen Van A', tasks: 24, completed: 22, rate: 92 },
  { name: 'Tran Thi B', tasks: 20, completed: 19, rate: 95 },
  { name: 'Le Minh C', tasks: 18, completed: 16, rate: 89 },
  { name: 'Pham Thi D', tasks: 16, completed: 15, rate: 94 },
  { name: 'Hoang Van E', tasks: 14, completed: 12, rate: 86 },
];

const alertCards = [
  {
    title: 'Task Alerts',
    description: '3 tasks are overdue and need immediate attention.',
    icon: Bell,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Staff Certifications',
    description: '8 staff need Health & Safety renewal this month.',
    icon: Star,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Efficiency Score',
    description: 'Current staff utilization rate is at a healthy 92%.',
    icon: BarChart3,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DashboardPage() {
  return (
    <PageWrapper>
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#191b23] leading-tight">
            Dashboard
          </h1>
          <p className="text-[14px] text-[#434654] mt-1">
            Overview of workforce, tasks, and store performance.
          </p>
        </div>
        <Button className="h-9 gap-2 bg-[#0052cc] hover:bg-[#003d9b] text-white shadow-md">
          <Plus className="w-4 h-4" />
          Create New Task
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {statsData.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
                    {stat.title}
                  </p>
                  <p className="text-[28px] font-bold text-[#191b23] tracking-tight leading-none">
                    {stat.value}
                  </p>
                  <p
                    className={`text-[12px] font-medium ${
                      stat.changeType === 'positive'
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgClass}`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Middle Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
        >
          {/* Task Status Chart */}
          <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5">
            <h3 className="text-[15px] font-semibold text-[#191b23] mb-4">
              Tasks by Status
            </h3>
            <div className="space-y-3.5">
              {taskStatusData.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-[13px] mb-1.5">
                    <span className="text-[#434654]">{item.status}</span>
                    <span className="font-semibold text-[#191b23]">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#f3f3fd] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Employees */}
          <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5">
            <h3 className="text-[15px] font-semibold text-[#191b23] mb-4">
              Top Performers
            </h3>
            <div className="space-y-3">
              {topEmployees.map((emp, idx) => {
                const rankColors = [
                  'bg-amber-400',
                  'bg-gray-400',
                  'bg-amber-700',
                  'bg-gray-300',
                  'bg-gray-300',
                ];
                return (
                  <div
                    key={emp.name}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        className={`${rankColors[idx]} text-white text-[11px] font-bold`}
                      >
                        {idx + 1}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#191b23] truncate">
                        {emp.name}
                      </p>
                      <p className="text-[11px] text-[#434654]/60">
                        {emp.completed}/{emp.tasks} tasks
                      </p>
                    </div>
                    <div className="text-[13px] font-bold text-emerald-600">
                      {emp.rate}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5">
            <h3 className="text-[15px] font-semibold text-[#191b23] mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: 'Create New Task',
                  icon: Plus,
                  bg: 'bg-[#e8edfb] text-[#0052cc] hover:bg-[#d4ddf8]',
                },
                {
                  label: 'Quick Assign',
                  icon: CheckCircle2,
                  bg: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                },
                {
                  label: 'View Schedule',
                  icon: Clock,
                  bg: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
                },
                {
                  label: 'Overdue Tasks (3)',
                  icon: AlertCircle,
                  bg: 'bg-red-50 text-red-600 hover:bg-red-100',
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${action.bg}`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Tasks Table */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e1ec]">
              <h3 className="text-[15px] font-semibold text-[#191b23]">
                Recent Tasks
              </h3>
              <button className="flex items-center gap-1 text-[13px] font-semibold text-[#0052cc] hover:text-[#003d9b] transition-colors">
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f3f3fd] border-b border-[#e0e1ec]">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
                      Task Name
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
                      Assignee
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
                      Branch
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e1ec]">
                  {recentTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-[#f3f3fd] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 text-[13px] font-medium text-[#191b23]">
                        {task.name}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#434654]">
                        {task.assignee}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#434654]">
                        {task.branch}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#434654] font-mono">
                        {task.dueDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Bottom Alert Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {alertCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-4 flex items-start gap-4 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <div
                className={`w-11 h-11 ${card.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#191b23]">
                  {card.title}
                </h4>
                <p className="text-[12px] text-[#434654] mt-0.5">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}
