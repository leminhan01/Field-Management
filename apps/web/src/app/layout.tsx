import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'FieldApp - Task Management',
  description: 'BB/BG agency task management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning>
        <Suspense>{children}</Suspense>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
