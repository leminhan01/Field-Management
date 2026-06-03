'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, BarChart3, Eye, ClipboardList, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PageToolbar } from '@/components/shared/page-toolbar';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { ResponseDetailDialog } from '@/components/surveys/response-detail-dialog';
import { getSurveys, getSurveyResponses } from '@/lib/surveys';
import type { SurveyDto, SurveyResponseDto, SurveyQuestion } from '@fieldapp/shared';
import type { Column } from '@/components/shared/data-table';

export default function SurveyResponsesPage() {
  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [responses, setResponses] = useState<SurveyResponseDto[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [page, setPage] = useState(1);
  const [viewingResponse, setViewingResponse] = useState<SurveyResponseDto | null>(null);

  useEffect(() => {
    getSurveys({ page: 1, limit: 100 })
      .then((result) => {
        setSurveys(result.data);
        if (result.data.length > 0 && !selectedSurveyId) {
          setSelectedSurveyId(result.data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSurveys(false));
  }, []);

  useEffect(() => {
    if (!selectedSurveyId) return;

    let cancelled = false;
    setLoading(true);

    getSurveyResponses(selectedSurveyId, { page, limit: 10 })
      .then((result) => {
        if (!cancelled) {
          setResponses(result.data);
          setMeta(result.meta);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedSurveyId, page]);

  const selectedSurvey = useMemo(
    () => surveys.find((s) => s.id === selectedSurveyId),
    [surveys, selectedSurveyId],
  );

  const selectedQuestions: SurveyQuestion[] = useMemo(
    () => (Array.isArray(selectedSurvey?.questions) ? selectedSurvey!.questions as SurveyQuestion[] : []),
    [selectedSurvey],
  );

  const columns: Column<SurveyResponseDto>[] = useMemo(() => [
    {
      key: 'user',
      header: 'Respondent',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold">
            {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-medium text-[13px] block leading-tight">{r.user?.name || '—'}</span>
            <span className="text-[11px] text-muted-foreground">{r.user?.email}</span>
          </div>
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
        const answers = r.answers as Record<string, unknown>;
        const count = Object.keys(answers).length;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[12px] font-medium">
            {count}/{selectedQuestions.length}
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
  ], [selectedQuestions.length]);

  return (
    <PageWrapper>
      <PageToolbar
        title="Survey Responses"
        description={`${meta.total} responses`}
      />

      {/* Survey selector card */}
      <div className="bg-white border rounded-xl p-5 mb-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Select Survey</p>
            </div>
          </div>
          <select
            value={selectedSurveyId}
            onChange={(e) => { setSelectedSurveyId(e.target.value); setPage(1); }}
            className="flex-1 h-10 text-[13px] font-medium border border-gray-300 rounded-lg px-4 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s._count?.responses ?? 0} responses)
              </option>
            ))}
          </select>
        </div>

        {/* Survey quick stats */}
        {selectedSurvey && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-[12px] text-gray-600 font-medium">
              <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
              {selectedQuestions.length} questions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-[12px] text-gray-600 font-medium">
              <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
              {meta.total} responses
            </span>
          </div>
        )}
      </div>

      {/* Responses table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5">
          {loading || loadingSurveys ? (
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
                columns={columns}
                data={responses as any[]}
                getRowId={(row) => (row as SurveyResponseDto).id}
              />
              <div className="mt-4">
                <Pagination
                  page={page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Response Detail Dialog */}
      <ResponseDetailDialog
        open={!!viewingResponse}
        response={viewingResponse}
        questions={selectedQuestions}
        onClose={() => setViewingResponse(null)}
      />
    </PageWrapper>
  );
}
