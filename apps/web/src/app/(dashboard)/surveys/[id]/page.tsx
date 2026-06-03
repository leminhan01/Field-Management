'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Play,
  XCircle,
  BarChart3,
  ClipboardList,
  Type,
  AlignLeft,
  CheckSquare,
  ListChecks,
  User,
  Calendar,
  MessageSquare,
  CircleDot,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { StatusBadge } from '@/components/shared/status-badge';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { ResponseDetailDialog } from '@/components/surveys/response-detail-dialog';
import { useSurvey } from '@/hooks/use-survey';
import { useSurveyMutations } from '@/hooks/use-survey-mutations';
import { getSurveyResponses, extractErrorMessage } from '@/lib/surveys';
import { QUESTION_TYPE_LABELS, type SurveyQuestion, type SurveyResponseDto } from '@fieldapp/shared';
import type { Column } from '@/components/shared/data-table';

function getQuestionIcon(type: string) {
  switch (type) {
    case 'SHORT_TEXT': return <Type className="w-4 h-4" />;
    case 'LONG_TEXT': return <AlignLeft className="w-4 h-4" />;
    case 'CHECKBOX': return <CheckSquare className="w-4 h-4" />;
    case 'MULTIPLE_CHOICE': return <ListChecks className="w-4 h-4" />;
    default: return <CircleDot className="w-4 h-4" />;
  }
}

function getQuestionTypeColor(type: string) {
  switch (type) {
    case 'SHORT_TEXT': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'LONG_TEXT': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'CHECKBOX': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'MULTIPLE_CHOICE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getQuestionIconBg(type: string) {
  switch (type) {
    case 'SHORT_TEXT': return 'bg-blue-100 text-blue-600';
    case 'LONG_TEXT': return 'bg-violet-100 text-violet-600';
    case 'CHECKBOX': return 'bg-amber-100 text-amber-600';
    case 'MULTIPLE_CHOICE': return 'bg-emerald-100 text-emerald-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

// ==================== Main Page ====================

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const { data: survey, loading, error } = useSurvey(surveyId);
  const { changeStatus } = useSurveyMutations();

  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [responses, setResponses] = useState<SurveyResponseDto[]>([]);
  const [responsesMeta, setResponsesMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [viewingResponse, setViewingResponse] = useState<SurveyResponseDto | null>(null);

  const loadResponses = useCallback(async (page = 1) => {
    setLoadingResponses(true);
    try {
      const result = await getSurveyResponses(surveyId, { page, limit: 10 });
      setResponses(result.data);
      setResponsesMeta(result.meta);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to load responses'));
    } finally {
      setLoadingResponses(false);
    }
  }, [surveyId]);

  const handleTabChange = useCallback((tab: 'questions' | 'responses') => {
    if (tab === 'responses' && activeTab !== 'responses') {
      loadResponses(1);
    }
    setActiveTab(tab);
  }, [activeTab, loadResponses]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    setChangingStatus(true);
    try {
      await changeStatus(surveyId, newStatus);
      toast.success(`Survey status changed to ${newStatus}`);
      window.location.reload();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to change status'));
    } finally {
      setChangingStatus(false);
    }
  }, [surveyId, changeStatus]);

  const responseColumns: Column<SurveyResponseDto>[] = [
    {
      key: 'user',
      header: 'Respondent',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold">
            {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="font-medium text-[13px]">{r.user?.name || '—'}</span>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (r) => <span className="text-[13px] text-muted-foreground">{r.branch?.name || '—'}</span>,
    },
    {
      key: 'submittedAt',
      header: 'Submitted at',
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {new Date(r.submittedAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'answers',
      header: 'Answers',
      render: (r) => {
        const answers = r.answers as Record<string, string | string[]>;
        const count = Object.keys(answers).length;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[12px] font-medium">
            {count} answered
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-14',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-[12px] text-primary hover:text-primary hover:bg-primary/5"
          onClick={() => setViewingResponse(r)}
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !survey) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-muted-foreground">{error || 'Survey not found'}</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/surveys')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />Back to surveys
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const questions = (Array.isArray(survey.questions) ? survey.questions : []) as SurveyQuestion[];
  const responseCount = survey._count?.responses ?? 0;

  return (
    <PageWrapper>
      {/* ==================== Header Banner ==================== */}
      <div className="bg-white border rounded-xl p-6 mb-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Top row: Back + Title + Status */}
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg border hover:bg-gray-50"
                onClick={() => router.push('/surveys')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-[22px] font-bold text-gray-900">{survey.title}</h1>
              <StatusBadge status={survey.status} />
            </div>

            {/* Description */}
            {survey.description && (
              <p className="text-[14px] text-muted-foreground ml-12 mb-4 leading-relaxed">
                {survey.description}
              </p>
            )}

            {/* Meta info pills */}
            <div className="flex items-center gap-2 ml-12 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-[12px] text-gray-600 font-medium">
                <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                {questions.length} questions
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-[12px] text-gray-600 font-medium">
                <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                {responseCount} responses
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-[12px] text-gray-600 font-medium">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {survey.createdBy?.name || 'Unknown'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-[12px] text-gray-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {new Date(survey.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {survey.status === 'DRAFT' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={changingStatus}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-9 px-4 text-[13px] font-semibold"
              >
                {changingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Activate
              </Button>
            )}
            {survey.status === 'ACTIVE' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('CLOSED')}
                disabled={changingStatus}
                className="gap-2 h-9 px-4 text-[13px] font-semibold border-gray-300 text-gray-600 hover:text-gray-800"
              >
                {changingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Close Survey
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== Tabs ==================== */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-5">
        <div className="flex border-b">
          <button
            className={`flex items-center gap-2 px-6 py-3.5 text-[13px] font-semibold border-b-2 transition-all ${
              activeTab === 'questions'
                ? 'border-primary text-primary bg-primary/[0.03]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => handleTabChange('questions')}
          >
            <MessageSquare className="w-4 h-4" />
            Questions ({questions.length})
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3.5 text-[13px] font-semibold border-b-2 transition-all ${
              activeTab === 'responses'
                ? 'border-primary text-primary bg-primary/[0.03]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => handleTabChange('responses')}
          >
            <BarChart3 className="w-4 h-4" />
            Responses ({responseCount})
          </button>
        </div>

        <div className="p-5">
          {/* ==================== Questions Tab ==================== */}
          {activeTab === 'questions' ? (
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-[14px]">No questions in this survey</p>
                </div>
              ) : (
                questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="group border rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    {/* Question header row */}
                    <div className="flex items-start gap-3.5">
                      {/* Question number + icon */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold ${getQuestionIconBg(q.type)}`}>
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Labels row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getQuestionTypeColor(q.type)}`}>
                            {getQuestionIcon(q.type)}
                            {QUESTION_TYPE_LABELS[q.type] || q.type}
                          </span>
                          {q.required && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                              * Required
                            </span>
                          )}
                        </div>

                        {/* Question text */}
                        <p className="text-[14px] font-medium text-gray-800 leading-relaxed mb-3">
                          {q.label}
                        </p>

                        {/* Options for choice questions */}
                        {(q.type === 'CHECKBOX' || q.type === 'MULTIPLE_CHOICE') && 'options' in q && q.options && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {q.options.map((opt, j) => (
                              <span
                                key={j}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[13px] text-gray-700"
                              >
                                <span className="w-5 h-5 rounded flex items-center justify-center bg-white border border-gray-300 text-[10px] font-bold text-gray-500">
                                  {String.fromCharCode(65 + j)}
                                </span>
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Placeholder hint for text questions */}
                        {(q.type === 'SHORT_TEXT' || q.type === 'LONG_TEXT') && 'placeholder' in q && q.placeholder && (
                          <p className="text-[12px] text-gray-400 italic mt-1">
                            Hint: &quot;{q.placeholder}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ==================== Responses Tab ==================== */
            <>
              {loadingResponses ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : responses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-[14px] text-muted-foreground font-medium">No responses yet</p>
                  <p className="text-[12px] text-gray-400 mt-1">Responses will appear here once people submit the survey.</p>
                </div>
              ) : (
                <>
                  <DataTable
                    columns={responseColumns}
                    data={responses as any[]}
                    getRowId={(row) => (row as SurveyResponseDto).id}
                  />
                  <div className="mt-4">
                    <Pagination
                      page={responsesMeta.page}
                      totalPages={responsesMeta.totalPages}
                      onPageChange={(p) => loadResponses(p)}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ==================== Response Detail Dialog ==================== */}
      <ResponseDetailDialog
        open={!!viewingResponse}
        response={viewingResponse}
        questions={questions}
        onClose={() => setViewingResponse(null)}
      />
    </PageWrapper>
  );
}
