import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, STATUS_LABELS } from '../../utils/constants';
import { useMyTaskDetail } from '../../hooks/useMyTasks';
import { formatDateTime } from '../../utils/date';

export default function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params || {};
  const { data, isLoading } = useMyTaskDetail(taskId);

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const task = data.task;
  const outlet = task.outlet;
  const template = task.template;
  const checklist: string[] = template?.checklist || [];

  const openMaps = () => {
    if (outlet?.latitude && outlet?.longitude) {
      const url = `https://maps.google.com/?q=${outlet.latitude},${outlet.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleStart = async () => {
    try {
      const apiClient = (await import('../../services/api')).default;
      await apiClient.patch(`/me/task-assignments/${data.id}/status`, {
        status: 'IN_PROGRESS',
      });
      Alert.alert('Thành công', 'Đã bắt đầu công việc');
      navigation.goBack();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleComplete = () => {
    navigation.navigate('ReportSubmit', {
      taskId: task.id,
      assignmentId: data.id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.title}>{task.title}</Text>
          {task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(data.status) + '20' },
              ]}
            >
              <Text style={{ color: getStatusColor(data.status), fontWeight: '500' }}>
                {STATUS_LABELS[data.status] || data.status}
              </Text>
            </View>
            <Text style={styles.typeText}>{task.type}</Text>
          </View>
        </View>

        {outlet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cửa hàng</Text>
            <Text style={styles.infoText}>{outlet.name}</Text>
            {outlet.address && (
              <Text style={styles.subInfoText}>{outlet.address}</Text>
            )}
            {outlet.latitude && outlet.longitude && (
              <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
                <Text style={styles.mapButtonText}>Mở Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          <Text style={styles.infoText}>
            Lịch: {formatDateTime(data.scheduledAt)}
          </Text>
        </View>

        {checklist.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checklist ({checklist.length})</Text>
            {checklist.map((item, idx) => (
              <View key={idx} style={styles.checklistItem}>
                <View style={styles.checkBox} />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          {data.status === 'PENDING' && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.buttonText}>Bắt đầu</Text>
            </TouchableOpacity>
          )}
          {(data.status === 'IN_PROGRESS' || data.status === 'PENDING') && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.buttonText}>Hoàn thành & Báo cáo</Text>
            </TouchableOpacity>
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
  section: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoText: { fontSize: 15, color: COLORS.textPrimary },
  subInfoText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  mapButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapButtonText: { color: COLORS.primary, fontWeight: '500' },
  checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: 10,
  },
  checklistText: { fontSize: 14, color: COLORS.textPrimary },
  actions: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32, gap: 8 },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loading: { textAlign: 'center', paddingVertical: 32, color: COLORS.textSecondary },
});
