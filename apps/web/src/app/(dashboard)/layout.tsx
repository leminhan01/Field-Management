'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/use-auth';
import { useSidebarStore } from '@/stores/sidebar-store';

const Sidebar = dynamic(() => import('@/components/layout/sidebar'), { ssr: false });
const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { collapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <motion.div
        className="flex flex-col min-h-screen"
        animate={{ marginLeft: collapsed ? 68 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Header />
        <main className="p-6 flex-1 bg-[#faf8ff]">
          <Suspense fallback={null}>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' as const }}
            >
              {children}
            </motion.div>
          </Suspense>
        </main>
      </motion.div>
    </div>
  );
}
