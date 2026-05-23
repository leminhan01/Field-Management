import React from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '../../components/layout/TopAppBar';
import StatusChip from '../../components/ui/StatusChip';
import { COLORS, SPACING } from '../../utils/constants';
import { useMyTaskDetail, useUpdateAssignmentStatus } from '../../hooks/useMyTasks';
import type { TaskDetailScreenProps } from '../../navigation/types';

const TaskDetailScreen = ({ route, navigation }: TaskDetailScreenProps) => {
  const { data: task, isLoading, isError, refetch } = useMyTaskDetail(route.params.taskId);
  const updateStatus = useUpdateAssignmentStatus();
  const insets = useSafeAreaInsets();

  const outlet = task?.task?.outlet;
  const template = task?.task?.template;

  const handleOpenMap = () => {
    if (outlet?.latitude && outlet?.longitude) {
      const url = `https://maps.google.com/maps?q=${outlet.latitude},${outlet.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleCall = () => {
    if (outlet?.address) {
      Linking.openURL(`tel:${outlet.address}`);
    }
  };

  const handleStartTask = () => {
    if (!task) return;
    Alert.alert('Bắt đầu', 'Bắt đầu thực hiện công việc này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Bắt đầu',
        onPress: () => {
          updateStatus.mutate(
            { assignmentId: task.id, status: 'IN_PROGRESS' },
            { onSuccess: () => refetch() },
          );
        },
      },
    ]);
  };

  const handleSubmitReport = () => {
    if (!task) return;
    navigation.navigate('ReportSubmit', { taskId: task.taskId, assignmentId: task.id });
  };

  if (isLoading) {
    return (
      <View style={styles.outer}>
        <TopAppBar title="Chi tiết công việc" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View style={styles.outer}>
        <TopAppBar title="Chi tiết công việc" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tải được chi tiết công việc.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isPending = task.status === 'PENDING';
  const isInProgress = task.status === 'IN_PROGRESS';

  return (
    <View style={styles.outer}>
      <TopAppBar title="Chi tiết công việc" showBackButton onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Map section */}
        <View style={styles.mapSection}>
          {outlet?.latitude && outlet?.longitude ? (
            <View style={styles.mapPlaceholder}>
              <MaterialCommunityIcons name="map-marker" size={48} color={COLORS.primary} />
              <Text style={styles.mapText}>{outlet.name}</Text>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <MaterialCommunityIcons name="map-outline" size={48} color={COLORS.onSurfaceVariant} />
              <Text style={styles.mapText}>Chưa có vị trí</Text>
            </View>
          )}

          {/* Store info overlay */}
          {outlet && (
            <View style={styles.storeOverlay}>
              <View style={styles.storeInfo}>
                <View style={styles.storeIconCircle}>
                  <MaterialCommunityIcons name="store" size={20} color={COLORS.onPrimary} />
                </View>
                <View style={styles.storeTextBlock}>
                  <Text style={styles.storeName}>{outlet.name}</Text>
                  {outlet.address ? (
                    <View style={styles.addressRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.onSurfaceVariant} />
                      <Text style={styles.addressText} numberOfLines={1}>{outlet.address}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.storeActions}>
                <TouchableOpacity style={styles.storeActionButton} onPress={handleOpenMap}>
                  <MaterialCommunityIcons name="directions" size={18} color={COLORS.primary} />
                  <Text style={styles.storeActionText}>Mở bản đồ</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <StatusChip status={task.status} />
          <Text style={styles.taskTitle}>{task.task.title}</Text>
          {task.task.description ? (
            <Text style={styles.taskDescription}>{task.task.description}</Text>
          ) : null}
        </View>

        {/* Contact card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>THÔNG TIN LIÊN HỆ</Text>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.onSurfaceVariant} />
            <Text style={styles.contactText}>{outlet?.name || 'Chưa có thông tin'}</Text>
          </View>
        </View>

        {/* Task requirements */}
        {template && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeader}>YÊU CẦU CÔNG VIỆC</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>Ưu tiên cao</Text>
              </View>
            </View>
            {template.checklist && template.checklist.length > 0 ? (
              template.checklist.map((item: string, index: number) => (
                <View key={index} style={styles.checklistItem}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={20}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.checklistText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>Không có yêu cầu cụ thể.</Text>
            )}
          </View>
        )}

        {/* Notes */}
        {task.notes && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>GHI CHÚ</Text>
            <Text style={styles.notesText}>{task.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed bottom action */}
      {(isPending || isInProgress) && (
        <View style={[styles.bottomAction, { paddingBottom: insets.bottom || SPACING.md }]}>
          <TouchableOpacity
            style={[styles.actionButton, isInProgress ? styles.actionButtonGreen : styles.actionButtonPrimary]}
            onPress={isInProgress ? handleSubmitReport : handleStartTask}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isInProgress ? 'send' : 'play'}
              size={20}
              color={COLORS.onPrimary}
            />
            <Text style={styles.actionButtonText}>
              {isInProgress ? 'Gửi báo cáo' : 'Bắt đầu thực hiện'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  errorText: {
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
  mapSection: {
    height: 220,
    backgroundColor: COLORS.surfaceContainer,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  storeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  storeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeTextBlock: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  storeActions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  storeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  storeActionText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statusRow: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.08,
    marginBottom: SPACING.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priorityBadge: {
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSecondaryContainer,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.onSurface,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  emptyNote: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 48,
    borderRadius: 8,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionButtonGreen: {
    backgroundColor: COLORS.submitGreen,
  },
  actionButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
