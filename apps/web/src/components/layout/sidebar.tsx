'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  CalendarRange,
  Settings,
  Store,
  MonitorSpeaker,
  ChevronDown,
  Briefcase,
  ChevronsLeft,
  LogOut,
  User,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';

interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: { key: string; label: string; href: string }[];
}

const managementMenu: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    key: 'employee',
    label: 'Employee',
    icon: Users,
    children: [
      { key: 'staff-list', label: 'Staff List', href: '/employees' },
      { key: 'attendance', label: 'Attendance', href: '/employees/attendance' },
    ],
  },
  {
    key: 'task',
    label: 'Task',
    icon: ClipboardList,
    children: [
      { key: 'all-tasks', label: 'All Tasks', href: '/tasks' },
      { key: 'my-tasks', label: 'My Tasks', href: '/tasks/my' },
    ],
  },
  {
    key: 'survey',
    label: 'Survey',
    icon: BarChart3,
    children: [
      { key: 'forms', label: 'Forms', href: '/surveys' },
      { key: 'responses', label: 'Responses', href: '/surveys/responses' },
    ],
  },
  {
    key: 'assignment',
    label: 'Assignment',
    icon: CalendarRange,
    children: [
      { key: 'regular-task', label: 'Regular Task', href: '/tasks/regular' },
      { key: 'scheduling', label: 'Scheduling', href: '/tasks/scheduling' },
      { key: 'device-task', label: 'Device Task', href: '/tasks/device-tasks' },
      { key: 'report', label: 'Report', href: '/tasks/reports' },
    ],
  },
];

const othersMenu: MenuItem[] = [
  { key: 'branch', label: 'Branch', icon: Store, href: '/branches' },
  { key: 'outlet', label: 'Outlet', icon: Store, href: '/outlets' },
  {
    key: 'devices',
    label: 'Devices',
    icon: MonitorSpeaker,
    children: [
      { key: 'camera', label: 'Camera', href: '/devices/camera' },
      { key: 'pos', label: 'POS', href: '/devices/pos' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: storeLogout } = useAuthStore();
  const { collapsed, toggle } = useSidebarStore();
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['assignment']);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isParentActive = (item: MenuItem) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

  const handleLogout = () => {
    storeLogout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(-2)
        .toUpperCase()
    : 'U';

  const renderNavItem = (item: MenuItem) => {
    const hasChildren = !!item.children;
    const active = hasChildren ? isParentActive(item) : item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.key}>
          <button
            onClick={() => toggleExpand(item.key)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all',
              active
                ? 'text-[#003d9b] bg-[#e7e7f2] font-semibold'
                : 'text-[#434654] hover:bg-[#ebedf5]',
              collapsed && 'justify-center px-0',
            )}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <motion.span
                  animate={{ rotate: expandedKeys.includes(item.key) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </motion.span>
              </>
            )}
          </button>
          {!collapsed && (
            <AnimatePresence>
              {expandedKeys.includes(item.key) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {item.children!.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={cn(
                        'block pl-9 pr-3 py-2 text-[13px] rounded-lg transition-all',
                        isActive(child.href)
                          ? 'text-[#003d9b] font-semibold bg-[#e7e7f2]'
                          : 'text-[#434654] hover:bg-[#ebedf5]',
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href!}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all',
          active
            ? 'text-[#003d9b] bg-[#e7e7f2] font-semibold'
            : 'text-[#434654] hover:bg-[#ebedf5]',
          collapsed && 'justify-center px-0',
        )}
      >
        <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-[#f3f3fd] border-r border-[#e0e1ec] flex flex-col z-50"
      animate={{ width: collapsed ? 68 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-10 h-10 rounded-xl bg-[#0052cc] flex items-center justify-center flex-shrink-0 shadow-md">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-[15px] font-bold text-[#191b23] leading-tight">
                FieldApp
              </div>
              <div className="text-[11px] text-[#434654] opacity-70">
                Agency Management
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Pill */}
      <div className="mx-3 mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full rounded-lg p-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-[#ebedf5] transition-colors',
                collapsed && 'justify-center',
              )}
            >
              <Avatar
                className="w-8 h-8 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0052cc, #7b61ff)' }}
              >
                <AvatarFallback className="bg-transparent text-white font-bold text-[11px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                    <div className="text-[13px] font-semibold text-[#191b23] truncate">
                      {user?.name || 'Admin'}
                    </div>
                    <div className="text-[11px] text-[#434654] truncate">
                      All Stores Management
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'user@email.com'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-px bg-[#e0e1ec] mx-4 mb-1" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="pb-4">
          {!collapsed && (
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#434654]/50 px-3 pt-3 pb-2">
              Management
            </div>
          )}
          {managementMenu.map(renderNavItem)}

          {!collapsed && (
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#434654]/50 px-3 pt-5 pb-2">
              Others
            </div>
          )}
          {othersMenu.map(renderNavItem)}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-[#e0e1ec] px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all',
            isActive('/settings')
              ? 'text-[#003d9b] bg-[#e7e7f2] font-semibold'
              : 'text-[#434654] hover:bg-[#ebedf5]',
            collapsed && 'justify-center',
          )}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#434654] hover:bg-[#ebedf5] transition-all',
            collapsed && 'justify-center',
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <div className="px-3 pb-3">
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="w-full h-9 rounded-lg border-[#e0e1ec] bg-white hover:bg-[#ebedf5]"
        >
          <ChevronsLeft
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              collapsed && 'rotate-180',
            )}
          />
        </Button>
      </div>
    </motion.aside>
  );
}
