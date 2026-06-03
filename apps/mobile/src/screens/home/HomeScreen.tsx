import React, { useCallback, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TopAppBar from '../../components/layout/TopAppBar';
import SummaryDashboard from '../../components/task/SummaryDashboard';
import TaskCard from '../../components/task/TaskCard';
import { COLORS, SPACING } from '../../utils/constants';
import { useMyTasks, useUpdateAssignmentStatus } from '../../hooks/useMyTasks';
import { useAuthStore } from '../../stores/auth-store';
import type { TaskStackParamList } from '../../navigation/types';
import type { MyTaskAssignmentDto } from '@fieldapp/shared';

type NavigationProp = NativeStackNavigationProp<TaskStackParamList, 'TaskList'>;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);
  const todayKey = useMemo(() => getLocalDateKey(), []);
  const { data, isLoading, isError, isRefetching, refetch } = useMyTasks({
    limit: 20,
    dateFrom: todayKey,
    dateTo: todayKey,
  });
  const updateStatus = useUpdateAssignmentStatus();

  const tasks = data?.data ?? [];
  const completedCount = tasks.filter((task) => task.status === 'COMPLETED' || task.status === 'APPROVED').length;
  const totalCount = tasks.length;
  const avatarText = user?.name?.charAt(0).toUpperCase() || 'U';

  const handleTaskPress = useCallback(
    (taskId: string) => {
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation],
  );

  const handleStartTask = useCallback(
    (task: MyTaskAssignmentDto) => {
      if (task.status === 'PENDING') {
        updateStatus.mutate(
          { assignmentId: task.id, status: 'IN_PROGRESS' },
          { onSuccess: () => navigation.navigate('TaskDetail', { taskId: task.taskId }) },
        );
        return;
      }

      navigation.navigate('TaskDetail', { taskId: task.taskId });
    },
    [navigation, updateStatus],
  );

  return (
    <View style={styles.outer}>
      <TopAppBar title="Điều hành Hiện trường" showMenuButton avatarText={avatarText} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />}
      >
        <SummaryDashboard completed={completedCount} total={totalCount} />

        <TouchableOpacity
          style={styles.surveyCard}
          onPress={() => navigation.navigate('SurveyList')}
          activeOpacity={0.7}
        >
          <View style={styles.surveyCardLeft}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={COLORS.primary} />
            <View style={styles.surveyCardText}>
              <Text style={styles.surveyCardTitle}>Khảo sát</Text>
              <Text style={styles.surveyCardSub}>Xem các khảo sát đang mở</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.72}>
            <Text style={styles.filterText}>Lọc</Text>
            <MaterialCommunityIcons name="filter-variant" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isLoading && tasks.length === 0 ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
            <Text style={styles.messageText}>Không tải được danh sách công việc.</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} activeOpacity={0.75}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={COLORS.onSurfaceVariant} />
            <Text style={styles.messageText}>Chưa có công việc nào trong hôm nay.</Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => handleTaskPress(task.taskId)}
                onActionPress={() => handleStartTask(task)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  filterButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  taskList: {
    gap: SPACING.sm,
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
  surveyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  surveyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  surveyCardText: {
    gap: 2,
  },
  surveyCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  surveyCardSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
});
