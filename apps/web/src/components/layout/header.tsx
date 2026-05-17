'use client';

import { useRouter } from 'next/navigation';
import { Search, Bell, HelpCircle, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';

export default function Header() {
  const router = useRouter();
  const { user, logout: storeLogout } = useAuthStore();

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

  return (
    <header className="h-16 bg-white border-b border-[#e0e1ec] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737685]" />
          <input
            className="w-full bg-[#f3f3fd] border border-[#e0e1ec] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 placeholder:text-[#737685]"
            placeholder="Search staff, tasks, locations..."
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-[#434654] hover:text-[#191b23] hover:bg-[#f3f3fd]"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-[12px] font-semibold tracking-wide hidden sm:inline">
            Support
          </span>
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-[#434654] hover:text-[#191b23] hover:bg-[#f3f3fd]"
          >
            <Bell className="w-[18px] h-[18px]" />
          </Button>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </div>

        <Separator orientation="vertical" className="h-8 bg-[#e0e1ec]" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-1.5 hover:bg-[#f3f3fd] rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                <Avatar
                  className="w-8 h-8"
                  style={{ background: 'linear-gradient(135deg, #0052cc, #7b61ff)' }}
                >
                  <AvatarFallback className="bg-transparent text-white font-bold text-[12px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <div className="text-[13px] font-semibold text-[#191b23] leading-tight">
                    {user?.name || 'User'}
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email || 'user@email.com'}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
