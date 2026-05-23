import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, STATUS_LABELS } from '../../utils/constants';
import { useMyTasks } from '../../hooks/useMyTasks';
import type { MyTaskAssignmentDto } from '@fieldapp/shared';
import dayjs from 'dayjs';

type FilterTab = 'all' | 'today' | 'upcoming' | 'completed';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'upcoming', label: 'Sắp tới' },
  { key: 'completed', label: 'Hoàn thành' },
];

export default function TaskListScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<FilterTab>('today');
  const [search, setSearch] = useState('');

  const queryParams = buildQueryParams(activeTab, search);
  const { data, isLoading, refetch } = useMyTasks(queryParams);
  const assignments = data?.data || [];

  const renderItem = ({ item }: { item: MyTaskAssignmentDto }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.taskId })}
    >
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.task.title}</Text>
        <Text style={styles.taskOutlet}>
          {item.task.outlet?.name || 'Chưa gán cửa hàng'}
        </Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskTime}>
            {dayjs(item.scheduledAt).format('DD/MM HH:mm')}
          </Text>
          <Text style={styles.taskType}>{item.task.type}</Text>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '20' },
        ]}
      >
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {STATUS_LABELS[item.status] || item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có công việc nào</Text>
        }
      />
    </SafeAreaView>
  );
}

function buildQueryParams(tab: FilterTab, search: string) {
  const params: Record<string, string> = { limit: '50' };

  if (search) params.search = search;

  switch (tab) {
    case 'today':
      params.dateFrom = dayjs().startOf('day').toISOString();
      params.dateTo = dayjs().endOf('day').toISOString();
      break;
    case 'upcoming':
      params.dateFrom = dayjs().add(1, 'day').startOf('day').toISOString();
      params.status = 'PENDING';
      break;
    case 'completed':
      params.status = 'COMPLETED';
      break;
  }

  return params;
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
  searchBar: { paddingHorizontal: 16, paddingTop: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textSecondary },
  tabTextActive: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
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
  taskMeta: { flexDirection: 'row', gap: 8, marginTop: 4 },
  taskTime: { fontSize: 12, color: COLORS.textSecondary },
  taskType: { fontSize: 12, color: COLORS.accent },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
