import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopAppBar from '../../components/layout/TopAppBar';
import { COLORS, SPACING } from '../../utils/constants';
import { useMySurveys } from '../../hooks/useSurveys';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TaskStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TaskStackParamList, 'SurveyList'>;

const SurveyListScreen = ({ navigation }: Props) => {
  const { data: surveys, isLoading, isRefetching, refetch, isError } = useMySurveys();

  return (
    <View style={styles.outer}>
      <TopAppBar
        title="Khảo sát"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      >
        {isLoading && !surveys?.length ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
            <Text style={styles.messageText}>Không tải được danh sách khảo sát.</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} activeOpacity={0.75}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : !surveys?.length ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={COLORS.onSurfaceVariant} />
            <Text style={styles.messageText}>Chưa có khảo sát nào đang mở.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {surveys.map((survey) => {
              const questionCount = Array.isArray(survey.questions) ? survey.questions.length : 0;
              return (
                <TouchableOpacity
                  key={survey.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('SurveyDetail', { surveyId: survey.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.cardIcon}>
                      <MaterialCommunityIcons name="clipboard-text-outline" size={22} color={COLORS.primary} />
                    </View>
                    <View style={styles.cardTextBlock}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {survey.title}
                      </Text>
                      <Text style={styles.cardSub}>
                        {questionCount} câu hỏi · {survey._count?.responses ?? 0} phản hồi
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SurveyListScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 96,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
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
  list: {
    gap: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextBlock: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
});
