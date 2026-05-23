'use client';

import { useCallback, useMemo, useState } from 'react';
import { ClipboardList, CopyPlus, Filter, FolderKanban, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { TASK_TYPE_LABELS } from '@fieldapp/shared';
import type {
  CreateTaskGroupInput,
  CreateTaskTemplateInput,
  TaskGroupDto,
  TaskTemplateDto,
  UpdateTaskGroupInput,
  UpdateTaskTemplateInput,
} from '@fieldapp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ActionMenu } from '@/components/shared/action-menu';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge, TypeBadge } from '@/components/shared/status-badge';
import { useBranches } from '@/hooks/use-branches';
import { useEmployees } from '@/hooks/use-employees';
import { useTaskGroups, useTaskTemplateOptions, useTaskTemplates } from '@/hooks/use-task-management';
import {
  assignTaskGroup,
  createTaskGroup,
  createTaskTemplate,
  deleteTaskGroup,
  deleteTaskTemplate,
  extractTaskManagementErrorMessage,
  updateTaskGroup,
  updateTaskTemplate,
} from '@/lib/task-management';

const TASK_TYPES = ['REGULAR', 'DEVICE_CHECK', 'SURVEY', 'PROMOTION'];
const EMPTY_TEMPLATE_FORM = {
  name: '',
  description: '',
  type: 'REGULAR',
  checklistText: '',
  photoRequired: true,
  estimatedDuration: '30',
  isActive: true,
};
const EMPTY_GROUP_FORM = {
  name: '',
  code: '',
  description: '',
  templateIds: [] as string[],
  isActive: true,
};
const EMPTY_ASSIGN_FORM = {
  assigneeId: '',
  branchId: '',
  scheduledAt: '',
  titlePrefix: '',
};

type TemplateFormState = typeof EMPTY_TEMPLATE_FORM;
type GroupFormState = typeof EMPTY_GROUP_FORM;
type AssignFormState = typeof EMPTY_ASSIGN_FORM;
type TemplateRow = TaskTemplateDto & Record<string, unknown>;
type GroupRow = TaskGroupDto & Record<string, unknown>;

function toChecklistText(checklist: unknown) {
  return Array.isArray(checklist) ? checklist.join('\n') : '';
}

function toChecklistArray(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

export default function TaskTemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [search, setSearch] = useState('');
  const [templatePage, setTemplatePage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplateDto | null>(null);
  const [editingGroup, setEditingGroup] = useState<TaskGroupDto | null>(null);
  const [assignGroupTarget, setAssignGroupTarget] = useState<TaskGroupDto | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(EMPTY_TEMPLATE_FORM);
  const [groupForm, setGroupForm] = useState<GroupFormState>(EMPTY_GROUP_FORM);
  const [assignForm, setAssignForm] = useState<AssignFormState>(EMPTY_ASSIGN_FORM);
  const [submitting, setSubmitting] = useState(false);

  const templateParams = useMemo(() => ({
    page: templatePage,
    limit: 10,
    search: activeTab === 'templates' ? search || undefined : undefined,
    type: typeFilter || undefined,
    isActive: statusFilter || undefined,
  }), [activeTab, search, statusFilter, templatePage, typeFilter]);

  const groupParams = useMemo(() => ({
    page: groupPage,
    limit: 10,
    search: activeTab === 'groups' ? search || undefined : undefined,
    isActive: statusFilter || undefined,
  }), [activeTab, groupPage, search, statusFilter]);

  const templates = useTaskTemplates(templateParams);
  const groups = useTaskGroups(groupParams);
  const templateOptions = useTaskTemplateOptions();
  const employees = useEmployees({ page: 1, limit: 100, isActive: 'true' });
  const branches = useBranches({ page: 1, limit: 100, isActive: 'true' });

  const resetTemplateForm = useCallback((template?: TaskTemplateDto | null) => {
    setEditingTemplate(template || null);
    setTemplateForm(template ? {
      name: template.name,
      description: template.description || '',
      type: template.type,
      checklistText: toChecklistText(template.checklist),
      photoRequired: template.photoRequired,
      estimatedDuration: template.estimatedDuration ? String(template.estimatedDuration) : '',
      isActive: template.isActive,
    } : EMPTY_TEMPLATE_FORM);
    setTemplateFormOpen(true);
  }, []);

  const resetGroupForm = useCallback((group?: TaskGroupDto | null) => {
    setEditingGroup(group || null);
    setGroupForm(group ? {
      name: group.name,
      code: group.code,
      description: group.description || '',
      templateIds: group.templates.map((item) => item.template.id),
      isActive: group.isActive,
    } : EMPTY_GROUP_FORM);
    setGroupFormOpen(true);
  }, []);

  const refetchAll = useCallback(() => {
    templates.refetch();
    groups.refetch();
    templateOptions.refetch();
  }, [groups, templateOptions, templates]);

  const handleTemplateSubmit = async () => {
    const checklist = toChecklistArray(templateForm.checklistText);
    if (!templateForm.name.trim() || !checklist.length) {
      toast.error('Template name and checklist are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTaskTemplateInput | UpdateTaskTemplateInput = {
        name: templateForm.name.trim(),
        description: templateForm.description.trim() || undefined,
        type: templateForm.type,
        checklist,
        photoRequired: templateForm.photoRequired,
        estimatedDuration: templateForm.estimatedDuration ? Number(templateForm.estimatedDuration) : undefined,
      };

      if (editingTemplate) {
        await updateTaskTemplate(editingTemplate.id, { ...payload, isActive: templateForm.isActive });
        toast.success('Task template updated');
      } else {
        await createTaskTemplate(payload as CreateTaskTemplateInput);
        toast.success('Created task templates');
      }

      setTemplateFormOpen(false);
      refetchAll();
    } catch (err) {
      toast.error(extractTaskManagementErrorMessage(err, 'Save task templates that bai'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupSubmit = async () => {
    if (!groupForm.name.trim() || !groupForm.code.trim() || !groupForm.templateIds.length) {
      toast.error('Name, group code, and task templates are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTaskGroupInput | UpdateTaskGroupInput = {
        name: groupForm.name.trim(),
        code: groupForm.code.trim().toUpperCase(),
        description: groupForm.description.trim() || undefined,
        templateIds: groupForm.templateIds,
      };

      if (editingGroup) {
        await updateTaskGroup(editingGroup.id, { ...payload, isActive: groupForm.isActive });
        toast.success('Da cap nhat task groups');
      } else {
        await createTaskGroup(payload as CreateTaskGroupInput);
        toast.success('Created task groups');
      }

      setGroupFormOpen(false);
      refetchAll();
    } catch (err) {
      toast.error(extractTaskManagementErrorMessage(err, 'Save task groups that bai'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignGroup = async () => {
    if (!assignGroupTarget || !assignForm.assigneeId || !assignForm.branchId || !assignForm.scheduledAt) {
      toast.error('Employee, chi nhanh va thoi gian assignments la bat buoc');
      return;
    }

    setSubmitting(true);
    try {
      const result = await assignTaskGroup(assignGroupTarget.id, {
        ...assignForm,
        titlePrefix: assignForm.titlePrefix.trim() || undefined,
      });
      toast.success(`Created ${result.assignedTasks.length} tasks from group`);
      setAssignOpen(false);
      setAssignGroupTarget(null);
      setAssignForm(EMPTY_ASSIGN_FORM);
    } catch (err) {
      toast.error(extractTaskManagementErrorMessage(err, 'Assign nhom that bai'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (template: TaskTemplateDto) => {
    if (!window.confirm(`Delete task templates "${template.name}"?`)) return;
    try {
      await deleteTaskTemplate(template.id);
      toast.success('Task template deleted');
      refetchAll();
    } catch (err) {
      toast.error(extractTaskManagementErrorMessage(err, 'Delete task templates that bai'));
    }
  };

  const handleDeleteGroup = async (group: TaskGroupDto) => {
    if (!window.confirm(`Delete task groups "${group.name}"?`)) return;
    try {
      await deleteTaskGroup(group.id);
      toast.success('Da xoa task groups');
      refetchAll();
    } catch (err) {
      toast.error(extractTaskManagementErrorMessage(err, 'Delete task groups that bai'));
    }
  };

  const toggleTemplateInGroup = (templateId: string) => {
    setGroupForm((current) => ({
      ...current,
      templateIds: current.templateIds.includes(templateId)
        ? current.templateIds.filter((id) => id !== templateId)
        : [...current.templateIds, templateId],
    }));
  };

  const templateColumns: Column<TemplateRow>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Task templates',
      render: (template) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-[#191b23]">{template.name}</p>
            <p className="line-clamp-1 max-w-[360px] text-[12px] text-muted-foreground">{template.description || 'No description'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (template) => <TypeBadge type={TASK_TYPE_LABELS[template.type] || template.type} />,
    },
    {
      key: 'checklist',
      header: 'Checklist',
      render: (template) => <Badge variant="outline">{Array.isArray(template.checklist) ? template.checklist.length : 0} items</Badge>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (template) => <span className="text-muted-foreground">{template.estimatedDuration || '-'} minutes</span>,
    },
    {
      key: 'photo',
      header: 'Photo',
      render: (template) => <span className="text-muted-foreground">{template.photoRequired ? 'Required' : 'Optional'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (template) => <StatusBadge status={template.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (template) => (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionMenu
            actions={[
              { label: 'Edit', onClick: () => resetTemplateForm(template) },
              { label: 'Delete', onClick: () => handleDeleteTemplate(template), variant: 'destructive' },
            ]}
          />
        </div>
      ),
    },
  ], [resetTemplateForm]);

  const groupColumns: Column<GroupRow>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Task groups',
      render: (group) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-[#191b23]">{group.name}</p>
            <p className="font-mono text-[12px] text-muted-foreground">{group.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'templates',
      header: 'Templates in group',
      render: (group) => (
        <div className="flex max-w-[360px] flex-wrap gap-1.5">
          {group.templates.slice(0, 3).map((item) => (
            <Badge key={item.id} variant="outline">{item.template.name}</Badge>
          ))}
          {group.templates.length > 3 && <Badge variant="secondary">+{group.templates.length - 3}</Badge>}
        </div>
      ),
    },
    {
      key: 'count',
      header: 'Template count',
      render: (group) => <Badge variant="outline">{group.templates.length} templates</Badge>,
    },
    {
      key: 'created',
      header: 'Ngay tao',
      render: (group) => <span className="text-muted-foreground">{formatDate(group.createdAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (group) => <StatusBadge status={group.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (group) => (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionMenu
            actions={[
              {
                label: 'Assign nhom',
                icon: <CopyPlus className="h-4 w-4" />,
                onClick: () => {
                  setAssignGroupTarget(group);
                  setAssignForm(EMPTY_ASSIGN_FORM);
                  setAssignOpen(true);
                },
              },
              { label: 'Edit', onClick: () => resetGroupForm(group) },
              { label: 'Delete', onClick: () => handleDeleteGroup(group), variant: 'destructive' },
            ]}
          />
        </div>
      ),
    },
  ], [resetGroupForm]);

  return (
    <PageWrapper>
      <PageToolbar
        title="Task management"
        description={activeTab === 'templates' ? `${templates.meta.total} task templates` : `${groups.meta.total} task groups`}
        searchPlaceholder={activeTab === 'templates' ? 'Search task templates...' : 'Search task groups...'}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setTemplatePage(1);
          setGroupPage(1);
        }}
        primaryAction={{
          label: activeTab === 'templates' ? 'Tao templates' : 'Create group',
          onClick: () => activeTab === 'templates' ? resetTemplateForm(null) : resetGroupForm(null),
        }}
        secondaryActions={
          <Button
            variant="outline"
            size="sm"
            className={`h-8 gap-1.5 text-[13px] ${showFilter ? 'border-[#0052cc] bg-[#0052cc]/10 text-[#0052cc]' : ''}`}
            onClick={() => setShowFilter((value) => !value)}
          >
            <Filter className="h-3.5 w-3.5" />Filters
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setSearch('');
        setStatusFilter('');
      }}>
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Task templates</TabsTrigger>
          <TabsTrigger value="groups">Task groups</TabsTrigger>
        </TabsList>

        {showFilter && (
          <div className="mb-4 grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-3">
            {activeTab === 'templates' && (
              <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Type tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TASK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{TASK_TYPE_LABELS[type] || type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9 justify-self-start" onClick={() => {
              setTypeFilter('');
              setStatusFilter('');
            }}>
              Delete bo loc
            </Button>
          </div>
        )}

        <TabsContent value="templates">
          {templates.loading && !templates.data.length ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DataTable columns={templateColumns} data={templates.data as TemplateRow[]} emptyMessage="No task templates found" />
              <div className="mt-4">
                <Pagination page={templatePage} totalPages={templates.meta.totalPages} onPageChange={setTemplatePage} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="groups">
          {groups.loading && !groups.data.length ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DataTable columns={groupColumns} data={groups.data as GroupRow[]} emptyMessage="No task groups found" />
              <div className="mt-4">
                <Pagination page={groupPage} totalPages={groups.meta.totalPages} onPageChange={setGroupPage} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={templateFormOpen} onOpenChange={(value) => !value && setTemplateFormOpen(false)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit task template' : 'Create task template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Ten templates *</Label>
                <Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Type tasks *</Label>
                <Select value={templateForm.type} onValueChange={(value) => setTemplateForm({ ...templateForm, type: value })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((type) => <SelectItem key={type} value={type}>{TASK_TYPE_LABELS[type] || type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} className="min-h-[72px] text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label>Checklist *</Label>
              <Textarea
                value={templateForm.checklistText}
                onChange={(e) => setTemplateForm({ ...templateForm, checklistText: e.target.value })}
                placeholder="Moi dong la mot hang items can thuc hien"
                className="min-h-[130px] text-[13px]"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Duration minutes</Label>
                <Input type="number" min={1} value={templateForm.estimatedDuration} onChange={(e) => setTemplateForm({ ...templateForm, estimatedDuration: e.target.value })} className="h-9 text-[13px]" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={templateForm.photoRequired} onCheckedChange={(value) => setTemplateForm({ ...templateForm, photoRequired: value })} />
                <Label>Required anh</Label>
              </div>
              {editingTemplate && (
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={templateForm.isActive} onCheckedChange={(value) => setTemplateForm({ ...templateForm, isActive: value })} />
                  <Label>Active</Label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setTemplateFormOpen(false)} disabled={submitting}>Cancel</Button>
              <Button size="sm" onClick={handleTemplateSubmit} disabled={submitting} className="bg-[#0052cc] hover:bg-[#003d9b]">
                {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={groupFormOpen} onOpenChange={(value) => !value && setGroupFormOpen(false)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit task group' : 'Create task group'}</DialogTitle>
            <DialogDescription>Select task templates to combine into an assignment set.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Group name *</Label>
                <Input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Group code *</Label>
                <Input value={groupForm.code} onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value.toUpperCase() })} className="h-9 text-[13px] uppercase" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} className="min-h-[72px] text-[13px]" />
            </div>
            <div className="space-y-2">
              <Label>Task templates *</Label>
              <div className="max-h-[240px] space-y-2 overflow-y-auto rounded-md border p-3">
                {templateOptions.loading ? (
                  <div className="flex h-20 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : templateOptions.data.length ? (
                  templateOptions.data.map((template) => (
                    <label key={template.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                      <Checkbox checked={groupForm.templateIds.includes(template.id)} onCheckedChange={() => toggleTemplateInGroup(template.id)} />
                      <span className="flex-1 text-[13px] font-medium">{template.name}</span>
                      <TypeBadge type={TASK_TYPE_LABELS[template.type] || template.type} />
                    </label>
                  ))
                ) : (
                  <p className="py-6 text-center text-[13px] text-muted-foreground">No active task templates yet</p>
                )}
              </div>
            </div>
            {editingGroup && (
              <div className="flex items-center gap-2">
                <Switch checked={groupForm.isActive} onCheckedChange={(value) => setGroupForm({ ...groupForm, isActive: value })} />
                <Label>Active</Label>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setGroupFormOpen(false)} disabled={submitting}>Cancel</Button>
              <Button size="sm" onClick={handleGroupSubmit} disabled={submitting} className="bg-[#0052cc] hover:bg-[#003d9b]">
                {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={(value) => !value && setAssignOpen(false)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Assign nhom</DialogTitle>
            <DialogDescription>{assignGroupTarget?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <Select value={assignForm.assigneeId} onValueChange={(value) => setAssignForm({ ...assignForm, assigneeId: value })}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.data.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Branch *</Label>
              <Select value={assignForm.branchId} onValueChange={(value) => setAssignForm({ ...assignForm, branchId: value })}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches.data.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Time *</Label>
                <Input type="datetime-local" value={assignForm.scheduledAt} onChange={(e) => setAssignForm({ ...assignForm, scheduledAt: e.target.value })} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Title prefix</Label>
                <Input value={assignForm.titlePrefix} onChange={(e) => setAssignForm({ ...assignForm, titlePrefix: e.target.value })} className="h-9 text-[13px]" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setAssignOpen(false)} disabled={submitting}>Cancel</Button>
              <Button size="sm" onClick={handleAssignGroup} disabled={submitting} className="bg-[#0052cc] hover:bg-[#003d9b]">
                {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
