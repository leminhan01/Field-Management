'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarRange,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  MonitorSpeaker,
  Plus,
  RefreshCw,
  Settings,
  Store,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { StatusBadge } from '@/components/shared/status-badge';
import { useDashboardOverview } from '@/hooks/use-dashboard-overview';
import type { DashboardAlertDto, DashboardModuleDto } from '@fieldapp/shared';
import type { LucideIcon } from 'lucide-react';

interface SummaryCard {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  iconClass: string;
  iconBg: string;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  className: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Create regular task',
    description: 'BB, BG, in-store promotion',
    href: '/tasks/regular',
    icon: ClipboardList,
    className: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  },
  {
    label: 'Schedule assignments',
    description: 'Plan by day, week, or month',
    href: '/tasks/scheduling',
    icon: CalendarRange,
    className: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  {
    label: 'Create task template',
    description: 'Checklist, required photos, duration',
    href: '/task-templates',
    icon: FileText,
    className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    label: 'Device inspection',
    description: 'Camera, POS, display, standee',
    href: '/tasks/device-tasks',
    icon: Camera,
    className: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
  },
];

const moduleIconMap: Record<string, LucideIcon> = {
  employees: Users,
  branches: Building2,
  outlets: Store,
  devices: MonitorSpeaker,
  surveys: BarChart3,
  settings: Settings,
};

const statusColorMap: Record<string, string> = {
  DRAFT: 'bg-gray-400',
  ASSIGNED: 'bg-amber-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
  APPROVED: 'bg-emerald-600',
  REJECTED: 'bg-red-500',
};

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Draft',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const typeLabelMap: Record<string, string> = {
  REGULAR: 'Regular',
  DEVICE_CHECK: 'Device',
  SURVEY: 'Survey',
  PROMOTION: 'Promotion',
};

const alertIconMap: Record<DashboardAlertDto['severity'], LucideIcon> = {
  info: AlertCircle,
  success: CheckCircle2,
  warning: Clock,
  danger: AlertCircle,
};

const alertClassMap: Record<DashboardAlertDto['severity'], string> = {
  info: 'text-blue-700 bg-blue-50',
  success: 'text-emerald-700 bg-emerald-50',
  warning: 'text-amber-700 bg-amber-50',
  danger: 'text-red-700 bg-red-50',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function buildSummaryCards(data: ReturnType<typeof useDashboardOverview>['data']): SummaryCard[] {
  return [
    {
      title: 'Staff',
      value: String(data?.summary.employees.total || 0),
      detail: `${data?.summary.employees.active || 0} active, ${data?.summary.employees.inactive || 0} inactive`,
      icon: Users,
      iconClass: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Branches / outlets',
      value: String((data?.summary.branches.total || 0) + (data?.summary.outlets.total || 0)),
      detail: `${data?.summary.branches.active || 0} branches, ${data?.summary.outlets.active || 0} active outlets`,
      icon: Store,
      iconClass: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Tasks this week',
      value: String(data?.summary.tasks.thisWeek || 0),
      detail: `${data?.summary.tasks.total || 0} tasks across the system`,
      icon: ClipboardCheck,
      iconClass: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      title: 'Tracked devices',
      value: String(data?.summary.devices.total || 0),
      detail: `${data?.summary.devices.active || 0} active, ${data?.summary.devices.issue || 0} need attention`,
      icon: MonitorSpeaker,
      iconClass: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
  ];
}

function ModuleIcon({ module }: { module: DashboardModuleDto }) {
  const Icon = moduleIconMap[module.key] || Settings;
  return <Icon className="w-4 h-4" />;
}

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardOverview();
  const summaryCards = buildSummaryCards(data);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#191b23] leading-tight">
            Dashboard
          </h1>
          <p className="text-[14px] text-[#434654] mt-1">
            FieldApp operations overview across staff, outlets, tasks, devices, and reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 gap-2"
            onClick={refetch}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </Button>
          <Button asChild className="h-9 gap-2 bg-[#0052cc] hover:bg-[#003d9b] text-white shadow-md">
            <Link href="/tasks/regular">
              <Plus className="w-4 h-4" />
              Create task
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">
                    {card.title}
                  </p>
                  <p className="text-[28px] font-bold text-[#191b23] tracking-tight leading-none mt-2">
                    {loading ? '...' : card.value}
                  </p>
                  <p className="text-[12px] text-[#434654] mt-2 leading-5">
                    {card.detail}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <card.icon className={`w-5 h-5 ${card.iconClass}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <motion.div variants={itemVariants} className="xl:col-span-2 bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e1ec]">
              <div>
                <h2 className="text-[15px] font-semibold text-[#191b23]">
                  Recent tasks
                </h2>
                <p className="text-[12px] text-[#434654] mt-0.5">
                  Tracked through Draft, Assigned, In Progress, Completed, and Approved/Rejected.
                </p>
              </div>
              <Link href="/tasks/regular" className="flex items-center gap-1 text-[13px] font-semibold text-[#0052cc] hover:text-[#003d9b] transition-colors">
                View all
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f3f3fd] border-b border-[#e0e1ec]">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">Task</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">Type</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">Outlet</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">Staff</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">Status</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#434654]/60">Due date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e1ec]">
                  {loading && !data ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#434654]">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Loading data
                      </td>
                    </tr>
                  ) : data?.recentTasks.length ? (
                    data.recentTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-[#f3f3fd] transition-colors">
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-[#191b23] whitespace-nowrap">{task.title}</td>
                        <td className="px-5 py-3.5 text-[13px] text-[#434654]">{typeLabelMap[task.type] || task.type}</td>
                        <td className="px-5 py-3.5 text-[13px] text-[#434654] whitespace-nowrap">{task.branch}</td>
                        <td className="px-5 py-3.5 text-[13px] text-[#434654] whitespace-nowrap">{task.assignee || 'Unassigned'}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={statusLabelMap[task.status] || task.status} /></td>
                        <td className="px-5 py-3.5 text-[13px] text-[#434654] font-mono whitespace-nowrap">{formatDate(task.dueDate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#434654]">
                        No tasks yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5">
            <h2 className="text-[15px] font-semibold text-[#191b23] mb-4">
              Task progress
            </h2>
            <div className="space-y-3.5">
              {(data?.taskStatuses || []).map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-[13px] mb-1.5">
                    <span className="text-[#434654]">{statusLabelMap[item.status] || item.status}</span>
                    <span className="font-semibold text-[#191b23]">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-[#f3f3fd] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${statusColorMap[item.status] || 'bg-gray-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                    />
                  </div>
                </div>
              ))}
              {!loading && !data?.taskStatuses.length && (
                <p className="text-[13px] text-[#434654]">No progress data yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5">
            <h2 className="text-[15px] font-semibold text-[#191b23] mb-4">
              Quick actions
            </h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${action.className}`}
                >
                  <action.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold truncate">{action.label}</span>
                    <span className="block text-[11px] opacity-75 truncate">{action.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-5">
            <h2 className="text-[15px] font-semibold text-[#191b23] mb-4">
              Built modules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {(data?.modules || []).map((module) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className="flex items-center gap-3 rounded-lg border border-[#e0e1ec] px-3 py-3 hover:border-[#0052cc]/40 hover:bg-[#f8faff] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#e8edfb] text-[#0052cc] flex items-center justify-center flex-shrink-0">
                    <ModuleIcon module={module} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#191b23] truncate">{module.label}</p>
                    <p className="text-[11px] text-[#434654] truncate">{module.count}</p>
                  </div>
                </Link>
              ))}
              {loading && !data && (
                <div className="col-span-full py-8 text-center text-[13px] text-[#434654]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading modules
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.alerts || []).map((alert) => {
            const Icon = alertIconMap[alert.severity];
            return (
              <div
                key={alert.key}
                className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e1ec] p-4 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${alertClassMap[alert.severity]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-[#191b23]">{alert.title}</h3>
                  <p className="text-[12px] text-[#434654] mt-1 leading-5">{alert.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}
