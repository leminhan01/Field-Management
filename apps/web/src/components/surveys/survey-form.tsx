'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/surveys';
import { QUESTION_TYPE_LABELS } from '@fieldapp/shared';
import type { SurveyDto, SurveyQuestion, QuestionType } from '@fieldapp/shared';

// ==================== Zod Schema ====================

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['SHORT_TEXT', 'LONG_TEXT', 'CHECKBOX', 'MULTIPLE_CHOICE']),
  label: z.string().min(1, 'Question text is required'),
  required: z.boolean(),
  order: z.number(),
  placeholder: z.string().optional(),
  options: z.array(z.string().min(1, 'Option cannot be empty')).optional(),
}).superRefine((data, ctx) => {
  if ((data.type === 'CHECKBOX' || data.type === 'MULTIPLE_CHOICE') && (!data.options || data.options.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must have at least 1 option',
      path: ['options'],
    });
  }
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(questionSchema).min(1, 'Must have at least 1 question'),
});

type FormData = z.infer<typeof formSchema>;

interface SurveyFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  survey?: SurveyDto | null;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

function generateId() {
  return crypto.randomUUID();
}

function createDefaultQuestion(index: number): SurveyQuestion {
  return {
    id: generateId(),
    type: 'SHORT_TEXT' as QuestionType,
    label: '',
    required: false,
    order: index,
  };
}

export function SurveyForm({ open, mode, survey, onClose, onSubmit }: SurveyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [createDefaultQuestion(0)],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    if (open && mode === 'edit' && survey) {
      const questions = Array.isArray(survey.questions)
        ? survey.questions.map((q: SurveyQuestion, i: number) => ({ ...q, order: i }))
        : [createDefaultQuestion(0)];
      reset({
        title: survey.title,
        description: survey.description || '',
        questions,
      });
    } else if (open && mode === 'create') {
      reset({
        title: '',
        description: '',
        questions: [createDefaultQuestion(0)],
      });
    }
    setServerError(null);
  }, [mode, survey, reset, open]);

  const handleFormSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const questions = data.questions.map((q, i) => ({
        ...q,
        order: i,
        // Clean up: only include options for choice questions
        ...(q.type !== 'CHECKBOX' && q.type !== 'MULTIPLE_CHOICE' ? { options: undefined } : {}),
      }));
      await onSubmit({ ...data, questions });
      onClose();
    } catch (err) {
      const fallback = mode === 'create' ? 'Failed to create survey' : 'Failed to update survey';
      setServerError(extractErrorMessage(err, fallback));
    } finally {
      setSubmitting(false);
    }
  };

  const addQuestion = () => {
    append(createDefaultQuestion(fields.length));
  };

  const moveQuestion = (from: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? from - 1 : from + 1;
    if (to >= 0 && to < fields.length) {
      move(from, to);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Survey' : 'Edit Survey'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input {...register('title')} placeholder="Enter survey title" className="h-9 text-[13px]" />
            {errors.title && <p className="text-[12px] text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea {...register('description')} placeholder="Enter survey description (optional)" className="text-[13px] min-h-[60px]" />
            {errors.description && <p className="text-[12px] text-red-500">{errors.description.message}</p>}
          </div>

          {/* Questions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[14px] font-semibold">Questions *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[12px]"
                onClick={addQuestion}
              >
                <Plus className="w-3.5 h-3.5" />Add Question
              </Button>
            </div>

            {errors.questions?.root && (
              <p className="text-[12px] text-red-500">{errors.questions.root.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const questionType = watch(`questions.${index}.type`);
                const isChoiceType = questionType === 'CHECKBOX' || questionType === 'MULTIPLE_CHOICE';

                return (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 bg-gray-50/50 space-y-3"
                  >
                    {/* Question Header */}
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-[12px] font-semibold text-muted-foreground">
                        Q{index + 1}
                      </span>
                      <div className="flex-1" />
                      {index > 0 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveQuestion(index, 'up')}>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {index < fields.length - 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveQuestion(index, 'down')}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => remove(index)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Question Type + Required */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Select
                          value={questionType}
                          onValueChange={(v) => {
                            setValue(`questions.${index}.type`, v as QuestionType);
                            if (v === 'CHECKBOX' || v === 'MULTIPLE_CHOICE') {
                              const currentOptions = watch(`questions.${index}.options`);
                              if (!currentOptions || currentOptions.length === 0) {
                                setValue(`questions.${index}.options`, ['Option A', 'Option B']);
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-[12px] text-muted-foreground">Required</Label>
                        <Switch
                          checked={watch(`questions.${index}.required`)}
                          onCheckedChange={(v) => setValue(`questions.${index}.required`, v)}
                        />
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-1">
                      <Input
                        {...register(`questions.${index}.label`)}
                        placeholder="Enter question text"
                        className="h-9 text-[13px]"
                      />
                      {errors.questions?.[index]?.label && (
                        <p className="text-[12px] text-red-500">{errors.questions[index].label?.message}</p>
                      )}
                    </div>

                    {/* Placeholder for text questions */}
                    {(questionType === 'SHORT_TEXT' || questionType === 'LONG_TEXT') && (
                      <div className="space-y-1">
                        <Input
                          {...register(`questions.${index}.placeholder`)}
                          placeholder="Placeholder text (optional)"
                          className="h-8 text-[12px]"
                        />
                      </div>
                    )}

                    {/* Options for choice questions */}
                    {isChoiceType && (
                      <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Options</Label>
                        <OptionList control={control} register={register} questionIndex={index} errors={errors} setValue={setValue} watch={watch} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-1 text-[11px] text-primary"
                          onClick={() => {
                            const currentOptions = watch(`questions.${index}.options`) || [];
                            setValue(`questions.${index}.options`, [...currentOptions, `Option ${String.fromCharCode(65 + currentOptions.length)}`]);
                          }}
                        >
                          <Plus className="w-3 h-3" />Add option
                        </Button>
                        {errors.questions?.[index]?.options && (
                          <p className="text-[12px] text-red-500">{errors.questions[index].options?.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="dashed"
              size="sm"
              className="w-full h-9 border-dashed border-2 text-[13px] text-muted-foreground hover:text-primary hover:border-primary"
              onClick={addQuestion}
            >
              <Plus className="w-4 h-4 mr-1.5" />Add Question
            </Button>
          </div>

          {/* Error */}
          {serverError && (
            <div className="whitespace-pre-line rounded-md bg-red-50 border border-red-200 p-3 text-[13px] text-red-700">
              {serverError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="bg-[#0052cc] hover:bg-[#003d9b]">
              {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Option List Sub-component ====================

interface OptionListProps {
  control: any;
  register: any;
  questionIndex: number;
  errors: any;
  setValue: any;
  watch: any;
}

function OptionList({ register, questionIndex, errors, setValue, watch }: OptionListProps) {
  const options = watch(`questions.${questionIndex}.options`) || [];

  return (
    <div className="space-y-1.5">
      {options.map((_: string, optIndex: number) => (
        <div key={optIndex} className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-5 text-center font-mono">
            {String.fromCharCode(65 + optIndex)}
          </span>
          <Input
            {...register(`questions.${questionIndex}.options.${optIndex}`)}
            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
            className="h-7 text-[12px] flex-1"
          />
          {options.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-400 hover:text-red-600"
              onClick={() => {
                const newOptions = [...options];
                newOptions.splice(optIndex, 1);
                setValue(`questions.${questionIndex}.options`, newOptions);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
