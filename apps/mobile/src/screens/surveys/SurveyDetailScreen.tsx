import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Checkbox, RadioButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '../../components/layout/TopAppBar';
import { COLORS, SPACING } from '../../utils/constants';
import { useMySurveyDetail, useSubmitSurveyResponse } from '../../hooks/useSurveys';
import { useAuthStore } from '../../stores/auth-store';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TaskStackParamList } from '../../navigation/types';
import type { SurveyQuestion, SurveyAnswers } from '@fieldapp/shared';

type Props = NativeStackScreenProps<TaskStackParamList, 'SurveyDetail'>;

const SurveyDetailScreen = ({ route, navigation }: Props) => {
  const { surveyId } = route.params;
  const { data: survey, isLoading, isError, refetch } = useMySurveyDetail(surveyId);
  const submitMutation = useSubmitSurveyResponse();
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();

  const [answers, setAnswers] = useState<SurveyAnswers>({});

  const questions: SurveyQuestion[] = Array.isArray(survey?.questions)
    ? (survey.questions as SurveyQuestion[])
    : [];

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleCheckbox = useCallback((questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // Validate required questions
    for (const q of questions) {
      if (q.required) {
        const answer = answers[q.id];
        if (
          answer === undefined ||
          answer === null ||
          answer === '' ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          Alert.alert('Thiếu thông tin', `Vui lòng trả lời câu hỏi: "${q.label}"`);
          return;
        }
      }
    }

    if (!user?.branchId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin chi nhánh của bạn.');
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc muốn gửi khảo sát này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gửi',
        onPress: () => {
          submitMutation.mutate(
            { surveyId, branchId: user.branchId!, answers },
            {
              onSuccess: () => {
                navigation.replace('SurveyConfirmation');
              },
              onError: (err: any) => {
                const msg = err?.response?.data?.message || 'Không thể gửi khảo sát. Vui lòng thử lại.';
                Alert.alert('Lỗi', msg);
              },
            },
          );
        },
      },
    ]);
  }, [questions, answers, user, surveyId, submitMutation, navigation]);

  if (isLoading) {
    return (
      <View style={styles.outer}>
        <TopAppBar title="Khảo sát" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (isError || !survey) {
    return (
      <View style={styles.outer}>
        <TopAppBar title="Khảo sát" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.messageText}>Không tải được khảo sát.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} activeOpacity={0.75}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <TopAppBar title={survey.title} showBackButton onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Survey header */}
          <View style={styles.header}>
            <Text style={styles.surveyTitle}>{survey.title}</Text>
            {survey.description ? (
              <Text style={styles.surveyDesc}>{survey.description}</Text>
            ) : null}
            <Text style={styles.surveyMeta}>
              {questions.length} câu hỏi · {survey._count?.responses ?? 0} phản hồi
            </Text>
          </View>

          {/* Questions */}
          {questions.map((q, index) => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Q{index + 1}</Text>
                <View style={styles.questionLabelRow}>
                  <Text style={styles.questionLabel}>{q.label}</Text>
                  {q.required && <Text style={styles.requiredMark}> *</Text>}
                </View>
              </View>

              {/* SHORT_TEXT */}
              {q.type === 'SHORT_TEXT' && (
                <TextInput
                  style={styles.shortInput}
                  placeholder={q.placeholder || 'Nhập câu trả lời...'}
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={(answers[q.id] as string) || ''}
                  onChangeText={(v) => setAnswer(q.id, v)}
                />
              )}

              {/* LONG_TEXT */}
              {q.type === 'LONG_TEXT' && (
                <TextInput
                  style={styles.longInput}
                  placeholder={q.placeholder || 'Nhập câu trả lời chi tiết...'}
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={(answers[q.id] as string) || ''}
                  onChangeText={(v) => setAnswer(q.id, v)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}

              {/* MULTIPLE_CHOICE */}
              {q.type === 'MULTIPLE_CHOICE' && q.options && (
                <RadioButton.Group
                  value={(answers[q.id] as string) || ''}
                  onValueChange={(v) => setAnswer(q.id, v)}
                >
                  {q.options.map((opt, j) => (
                    <RadioButton.Item
                      key={j}
                      label={opt}
                      value={opt}
                      style={styles.radioItem}
                      labelStyle={styles.radioLabel}
                      color={COLORS.primary}
                    />
                  ))}
                </RadioButton.Group>
              )}

              {/* CHECKBOX */}
              {q.type === 'CHECKBOX' && q.options && (
                <View style={styles.checkboxGroup}>
                  {q.options.map((opt, j) => {
                    const selected = ((answers[q.id] as string[]) || []).includes(opt);
                    return (
                      <Checkbox.Item
                        key={j}
                        label={opt}
                        status={selected ? 'checked' : 'unchecked'}
                        onPress={() => toggleCheckbox(q.id, opt)}
                        style={styles.checkboxItem}
                        labelStyle={styles.checkboxLabel}
                        color={COLORS.primary}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Submit button */}
        <View style={[styles.bottomAction, { paddingBottom: insets.bottom || SPACING.md }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
            activeOpacity={0.78}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color={COLORS.onPrimary} />
            )}
            <Text style={styles.submitButtonText}>
              {submitMutation.isPending ? 'Đang gửi...' : 'Gửi khảo sát'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SurveyDetailScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 120,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.primaryContainer,
  },
  retryText: {
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  header: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: 6,
  },
  surveyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  surveyDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
  },
  surveyMeta: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onPrimary,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  questionLabelRow: {
    flex: 1,
    flexDirection: 'row',
  },
  questionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    lineHeight: 22,
  },
  requiredMark: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },
  shortInput: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  longInput: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
    minHeight: 100,
  },
  radioItem: {
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 15,
    color: COLORS.onSurface,
  },
  checkboxGroup: {
    gap: 0,
  },
  checkboxItem: {
    paddingVertical: 4,
  },
  checkboxLabel: {
    fontSize: 15,
    color: COLORS.onSurface,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  submitButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.submitGreen,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
