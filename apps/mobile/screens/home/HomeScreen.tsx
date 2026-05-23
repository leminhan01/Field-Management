import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, STATUS_LABELS } from '../../utils/constants';
import { useMyTasks } from '../../hooks/useMyTasks';
import { useAuthStore } from '../../stores/auth-store';
import dayjs from 'dayjs';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch } = useMyTasks({
    dateFrom: dayjs().startOf('day').toISOString(),
    dateTo: dayjs().endOf('day').toISOString(),
    limit: 50,
  });

  const assignments = data?.data || [];
  const todayCount = assignments.length;
  const completedCount = assignments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'APPROVED',
  ).length;
  const inProgressCount = assignments.filter(
    (a) => a.status === 'IN_PROGRESS',
  ).length;
  const overdueCount = assignments.filter(
    (a) =>
      a.status !== 'COMPLETED' &&
      a.status !== 'APPROVED' &&
      dayjs(a.scheduledAt).isBefore(dayjs(), 'day'),
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Xin chào, {user?.name || 'Staff'}</Text>
          <Text style={styles.date}>{dayjs().format('dddd, DD/MM/YYYY')}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.statValue}>{todayCount}</Text>
            <Text style={styles.statLabel}>Hôm nay</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.accent }]}>
            <Text style={styles.statValue}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.error }]}>
            <Text style={styles.statValue}>{overdueCount}</Text>
            <Text style={styles.statLabel}>Quá hạn</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Công việc hôm nay</Text>
          {assignments.length === 0 ? (
            <Text style={styles.emptyText}>Không có công việc nào</Text>
          ) : (
            assignments.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.task.title}</Text>
                  <Text style={styles.taskOutlet}>
                    {item.task.outlet?.name || '--'}
                  </Text>
                  <Text style={styles.taskTime}>
                    {dayjs(item.scheduledAt).format('HH:mm')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {STATUS_LABELS[item.status] || item.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: COLORS.warning,
    ASSIGNED: COLORS.primary,
    IN_PROGRESS: COLORS.accent,
    COMPLETED: COLORS.success,
    APPROVED: COLORS.success,
    REJECTED: COLORS.error,
  };
  return map[status] || COLORS.textSecondary;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  date: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  taskOutlet: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  taskTime: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
