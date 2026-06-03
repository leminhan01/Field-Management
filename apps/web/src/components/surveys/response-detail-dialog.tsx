'use client';

import {
  Type,
  AlignLeft,
  CheckSquare,
  ListChecks,
  CircleDot,
  Check,
  Eye,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QUESTION_TYPE_LABELS, type SurveyQuestion, type SurveyResponseDto, type SurveyAnswers } from '@fieldapp/shared';

// ==================== Helpers ====================

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

export function getQuestionIconBg(type: string) {
  switch (type) {
    case 'SHORT_TEXT': return 'bg-blue-100 text-blue-600';
    case 'LONG_TEXT': return 'bg-violet-100 text-violet-600';
    case 'CHECKBOX': return 'bg-amber-100 text-amber-600';
    case 'MULTIPLE_CHOICE': return 'bg-emerald-100 text-emerald-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getAnswerAccentBg(type: string) {
  switch (type) {
    case 'SHORT_TEXT': return 'bg-blue-50 border-blue-200';
    case 'LONG_TEXT': return 'bg-violet-50 border-violet-200';
    case 'CHECKBOX': return 'bg-amber-50 border-amber-200';
    case 'MULTIPLE_CHOICE': return 'bg-emerald-50 border-emerald-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}

function getOptionSelectedBg(type: string) {
  switch (type) {
    case 'MULTIPLE_CHOICE': return 'bg-emerald-50 border-emerald-400 text-emerald-800';
    case 'CHECKBOX': return 'bg-amber-50 border-amber-400 text-amber-800';
    default: return 'bg-blue-50 border-blue-400 text-blue-800';
  }
}

// ==================== Dialog Component ====================

interface ResponseDetailDialogProps {
  open: boolean;
  response: SurveyResponseDto | null;
  questions: SurveyQuestion[];
  onClose: () => void;
}

export function ResponseDetailDialog({ open, response, questions, onClose }: ResponseDetailDialogProps) {
  if (!response) return null;

  const answers = (response.answers || {}) as SurveyAnswers;
  const answeredCount = Object.keys(answers).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-[16px]">Response Detail</DialogTitle>
          </div>
        </DialogHeader>

        {/* Respondent info card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border mb-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
            {response.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-gray-900">{response.user?.name || 'Unknown'}</p>
            <p className="text-[12px] text-gray-500">{response.user?.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[12px] text-gray-500">{response.branch?.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {new Date(response.submittedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Completion summary */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span><strong className="text-gray-700">{answeredCount}</strong>/{questions.length} answered</span>
          </div>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${questions.length ? Math.round((answeredCount / questions.length) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Question-Answer list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {questions.map((q, i) => {
            const answer = answers[q.id];
            const hasAnswer = answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0);

            return (
              <div key={q.id} className="border rounded-xl overflow-hidden">
                {/* Question header */}
                <div className="flex items-start gap-3 p-4 bg-white">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold ${getQuestionIconBg(q.type)}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getQuestionTypeColor(q.type)}`}>
                        {getQuestionIcon(q.type)}
                        {QUESTION_TYPE_LABELS[q.type] || q.type}
                      </span>
                      {q.required && (
                        <span className="text-[10px] font-semibold text-red-500">Required</span>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-gray-800 leading-relaxed">{q.label}</p>
                  </div>
                </div>

                {/* Answer section */}
                <div className={`border-t px-4 py-3 ${hasAnswer ? getAnswerAccentBg(q.type) : 'bg-gray-50'}`}>
                  {hasAnswer ? (
                    <>
                      {/* SHORT_TEXT / LONG_TEXT answer */}
                      {(q.type === 'SHORT_TEXT' || q.type === 'LONG_TEXT') && (
                        <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {answer as string}
                        </p>
                      )}

                      {/* MULTIPLE_CHOICE answer */}
                      {q.type === 'MULTIPLE_CHOICE' && 'options' in q && q.options && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt, j) => {
                            const isSelected = opt === answer;
                            return (
                              <span
                                key={j}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                                  isSelected
                                    ? getOptionSelectedBg(q.type)
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {isSelected ? <Check className="w-3 h-3" /> : String.fromCharCode(65 + j)}
                                </span>
                                {opt}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* CHECKBOX answer */}
                      {q.type === 'CHECKBOX' && 'options' in q && q.options && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt, j) => {
                            const selectedOpts = answer as string[];
                            const isSelected = selectedOpts.includes(opt);
                            return (
                              <span
                                key={j}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                                  isSelected
                                    ? getOptionSelectedBg(q.type)
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded flex items-center justify-center ${
                                  isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 border border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </span>
                                {opt}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-[12px] text-gray-400 italic">Not answered</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
