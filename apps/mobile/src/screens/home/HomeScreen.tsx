import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<TaskStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useMyTasks({ limit: 20 });
  const updateStatus = useUpdateAssignmentStatus();

  const tasks = data?.data ?? [];
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
  const totalCount = tasks.length;
  const avatarText = user?.name?.charAt(0).toUpperCase() || 'U';

  const handleTaskPress = useCallback(
    (taskId: string) => {
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation],
  );

  const handleStartTask = useCallback(
    (task: typeof tasks[0]) => {
      if (task.status === 'PENDING') {
        updateStatus.mutate({ assignmentId: task.id, status: 'IN_PROGRESS' });
      } else if (task.status === 'IN_PROGRESS') {
        navigation.navigate('TaskDetail', { taskId: task.taskId });
      }
    },
    [updateStatus, navigation],
  );

  return (
    <View style={styles.outer}>
      <TopAppBar
        title="Điều hành Hiện trường"
        showMenuButton
        avatarText={avatarText}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[COLORS.primary]} />}
      >
        <SummaryDashboard completed={completedCount} total={totalCount} />

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Task list */}
        {isLoading && tasks.length === 0 ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
            <Text style={styles.messageText}>Không tải được danh sách công việc.</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={COLORS.onSurfaceVariant} />
            <Text style={styles.messageText}>Chưa có công việc nào.</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => handleTaskPress(task.taskId)}
              onActionPress={() => handleStartTask(task)}
            />
          ))
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
    paddingBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primaryContainer,
  },
  retryText: {
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
});
