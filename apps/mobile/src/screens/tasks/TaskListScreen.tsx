import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../../components/layout/ScreenShell';
import { useMyTasks } from '../../hooks/useMyTasks';
import { COLORS, SPACING } from '../../utils/constants';

const TaskListScreen = () => {
  const { data, isLoading, isError } = useMyTasks();

  return (
    <ScreenShell title="Công việc" subtitle="Danh sách công việc được phân công">
      {isLoading ? <ActivityIndicator color={COLORS.primary} /> : null}
      {isError ? <Text style={styles.message}>Không tải được danh sách công việc.</Text> : null}
      {!isLoading && !isError ? (
        <View style={styles.empty}>
          <Text style={styles.message}>
            {data?.data?.length ? 'Dữ liệu công việc đã sẵn sàng.' : 'Chưa có công việc nào.'}
          </Text>
        </View>
      ) : null}
    </ScreenShell>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  message: {
    color: COLORS.onSurface,
    fontSize: 14,
  },
});
