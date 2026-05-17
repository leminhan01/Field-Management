'use client';

import { Suspense } from 'react';
import { Settings, Bell, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PageWrapper } from '@/components/shared/page-wrapper';

const settingsGroups = [
  {
    title: 'General',
    icon: Settings,
    items: [
      { id: 'sys-name', label: 'System Name', value: 'FieldApp Management', type: 'text' as const },
      { id: 'lang', label: 'Default Language', value: 'Vietnamese', type: 'text' as const },
      { id: 'tz', label: 'Timezone', value: 'Asia/Ho_Chi_Minh (UTC+7)', type: 'text' as const },
      { id: 'df', label: 'Date Format', value: 'DD/MM/YYYY', type: 'text' as const },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { id: 'email-notif', label: 'Email Notifications', value: true, type: 'toggle' as const },
      { id: 'task-alert', label: 'Task Assignment Alert', value: true, type: 'toggle' as const },
      { id: 'overdue', label: 'Overdue Task Reminder', value: true, type: 'toggle' as const },
      { id: 'daily', label: 'Daily Report Summary', value: false, type: 'toggle' as const },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { id: 'session', label: 'Session Timeout', value: '30 minutes', type: 'text' as const },
      { id: 'password', label: 'Password Policy', value: 'Strong (min 8 chars)', type: 'text' as const },
      { id: '2fa', label: 'Two-Factor Authentication', value: false, type: 'toggle' as const },
      { id: 'attempts', label: 'Login Attempts Limit', value: '5 attempts', type: 'text' as const },
    ],
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function SettingsContent() {
  return (
    <PageWrapper>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
        {settingsGroups.map((group) => (
          <motion.div key={group.title} variants={cardVariants}>
            <Card className="border shadow-sm">
              <CardHeader className="pb-0">
                <div className="flex items-center gap-2.5">
                  <group.icon className="w-4.5 h-4.5 text-primary" />
                  <CardTitle className="text-[15px]">{group.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/50">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <Label htmlFor={item.id} className="text-[13.5px] cursor-pointer">{item.label}</Label>
                      {item.type === 'toggle' ? (
                        <Switch id={item.id} defaultChecked={item.value as boolean} />
                      ) : (
                        <span className="text-[13px] text-muted-foreground bg-muted px-3 py-1.5 rounded-md">{item.value as string}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Save */}
        <div className="flex justify-end">
          <Button size="lg" className="shadow-md shadow-primary/25">Save Changes</Button>
        </div>
      </motion.div>
    </PageWrapper>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
