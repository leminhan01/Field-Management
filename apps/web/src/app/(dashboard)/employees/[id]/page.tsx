'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { StatusBadge, RoleBadge } from '@/components/shared/status-badge';
import { toast } from 'sonner';
import { useEmployee } from '@/hooks/use-employee';
import { useEmployeeMutations } from '@/hooks/use-employee-mutations';
import { extractErrorMessage } from '@/lib/employees';import { ROLE_LABELS } from '@fieldapp/shared';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: employee, loading, error } = useEmployee(id);
  const { remove } = useEmployeeMutations();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!employee) return;
    setDeleting(true);
    try {
      await remove(employee.id);
      toast.success(`Deleted employee ${employee.name}`);
      router.push('/employees');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to delete employee');
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !employee) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">{error || 'Employee not found'}</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/employees')}>
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const infoItems = [
    { icon: Mail, label: 'Email', value: employee.email },
    { icon: Phone, label: 'Phone number', value: employee.phone || '—' },
    { icon: MapPin, label: 'Branch', value: employee.branch?.name || '—' },
    { icon: Shield, label: 'Role', value: ROLE_LABELS[employee.role] || employee.role },
    { icon: Calendar, label: 'Created date', value: new Date(employee.createdAt).toLocaleDateString('vi-VN') },
    {
      icon: Calendar,
      label: 'Last updated',
      value: new Date(employee.updatedAt).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/employees')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-[22px] font-semibold text-[#191b23]">Employee details</h1>
            <p className="text-[14px] text-[#434654]">Employees / {employee.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4 mr-1" />Delete
          </Button>
          <Button size="sm" className="bg-[#0052cc] hover:bg-[#003d9b]" onClick={() => router.push('/employees')}>
            <Pencil className="w-4 h-4 mr-1" />Edit
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20" style={!employee.avatar ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : undefined}>
              {employee.avatar && <AvatarImage src={employee.avatar} alt={employee.name} />}
              <AvatarFallback className={`${employee.avatar ? '' : 'bg-transparent'} text-white text-[24px] font-bold`}>
                {employee.name.split(' ').map((n) => n[0]).join('').slice(-2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-semibold text-[#191b23]">{employee.name}</h2>
                <RoleBadge role={employee.role.replace(/_/g, ' ')} />
              </div>
              <p className="text-[14px] text-muted-foreground">{employee.email}</p>
              <div className="pt-2">
                <StatusBadge status={employee.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[12px] text-muted-foreground">{item.label}</p>
                  <p className="text-[13px] text-[#191b23]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Branch Detail */}
          {employee.branch && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#191b23] mb-3">Branch information</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[12px] text-muted-foreground">Branch name</p>
                      <p className="text-[13px] text-[#191b23]">{employee.branch.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[12px] text-muted-foreground">Branch code</p>
                      <p className="text-[13px] text-[#191b23] font-mono">{employee.branch.code}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete employee <strong>{employee.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
