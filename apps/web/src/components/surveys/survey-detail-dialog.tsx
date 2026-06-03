'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { QUESTION_TYPE_LABELS, type SurveyDto, type SurveyQuestion } from '@fieldapp/shared';
import { ClipboardList, Type, AlignLeft, CheckSquare, ListChecks } from 'lucide-react';

interface SurveyDetailDialogProps {
  open: boolean;
  survey: SurveyDto | null;
  onClose: () => void;
}

function getQuestionIcon(type: string) {
  switch (type) {
    case 'SHORT_TEXT': return <Type className="w-3.5 h-3.5" />;
    case 'LONG_TEXT': return <AlignLeft className="w-3.5 h-3.5" />;
    case 'CHECKBOX': return <CheckSquare className="w-3.5 h-3.5" />;
    case 'MULTIPLE_CHOICE': return <ListChecks className="w-3.5 h-3.5" />;
    default: return <ClipboardList className="w-3.5 h-3.5" />;
  }
}

export function SurveyDetailDialog({ open, survey, onClose }: SurveyDetailDialogProps) {
  if (!survey) return null;

  const questions = (Array.isArray(survey.questions) ? survey.questions : []) as SurveyQuestion[];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Survey Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-[15px] font-semibold">{survey.title}</h3>
              <StatusBadge status={survey.status} />
            </div>
            {survey.description && (
              <p className="text-[13px] text-muted-foreground">{survey.description}</p>
            )}
            <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
              <span>{questions.length} questions</span>
              <span>{survey._count?.responses ?? 0} responses</span>
              <span>Created by {survey.createdBy?.name}</span>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Questions</h4>
            {questions.map((q, i) => (
              <div key={q.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Q{i + 1}
                  </span>
                  {getQuestionIcon(q.type)}
                  <Badge variant="outline" className="text-[10px] h-5">
                    {QUESTION_TYPE_LABELS[q.type] || q.type}
                  </Badge>
                  {q.required && (
                    <Badge className="text-[10px] h-5 bg-red-100 text-red-700 border-red-200">Required</Badge>
                  )}
                </div>
                <p className="text-[13px]">{q.label}</p>

                {/* Show options for choice questions */}
                {(q.type === 'CHECKBOX' || q.type === 'MULTIPLE_CHOICE') && 'options' in q && q.options && (
                  <div className="pl-3 border-l-2 border-muted space-y-1">
                    {q.options.map((opt, j) => (
                      <div key={j} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <span className="font-mono text-[10px] bg-muted px-1 rounded">
                          {String.fromCharCode(65 + j)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
