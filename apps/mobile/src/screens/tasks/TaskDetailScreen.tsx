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
  const hasCoordinates = outlet?.latitude != null && outlet?.longitude != null;
  const hasMapTarget = hasCoordinates || Boolean(outlet?.address);

  const handleOpenMap = () => {
    if (!outlet || !hasMapTarget) return;

    const query =
      hasCoordinates
        ? `${outlet.latitude},${outlet.longitude}`
        : encodeURIComponent(outlet.address || outlet.name);

    Linking.openURL(`https://maps.google.com/maps?q=${query}`);
  };

  const handleCall = () => {
    if (!outlet?.phone) return;
    Linking.openURL(`tel:${outlet.phone}`);
  };

  const handleStartTask = () => {
    if (!task) return;

    Alert.alert('Bắt đầu công việc', 'Bắt đầu thực hiện công việc này?', [
      { text: 'Hủy', style: 'cancel' },
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
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} activeOpacity={0.75}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isPending = task.status === 'PENDING';
  const isInProgress = task.status === 'IN_PROGRESS';
  const note = task.notes || task.task.description;

  return (
    <View style={styles.outer}>
      <TopAppBar title="Chi tiết công việc" showBackButton onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapSection}>
          <View style={styles.mapCanvas}>
            <View style={[styles.mapRoad, styles.mapRoadPrimary]} />
            <View style={[styles.mapRoad, styles.mapRoadSecondary]} />
            <View style={[styles.mapRoad, styles.mapRoadDiagonal]} />
            <View style={styles.mapBlockOne} />
            <View style={styles.mapBlockTwo} />
            <View style={styles.mapPin}>
              <MaterialCommunityIcons name="map-marker" size={30} color={COLORS.primary} />
            </View>
          </View>

          {outlet ? (
            <View style={styles.storeOverlay}>
              <View style={styles.storeIconCircle}>
                <MaterialCommunityIcons name="storefront" size={24} color={COLORS.onPrimary} />
              </View>
              <View style={styles.storeTextBlock}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {outlet.name}
                </Text>
                <View style={styles.addressRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {outlet.address || 'Chưa có địa chỉ'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <StatusChip status={task.status} />
              <TouchableOpacity
                style={[styles.mapButton, !hasMapTarget && styles.mapButtonDisabled]}
                onPress={handleOpenMap}
                disabled={!hasMapTarget}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons name="directions" size={18} color={COLORS.primary} />
                <Text style={styles.mapButtonText}>Mở bản đồ</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.taskTitle}>{task.task.title}</Text>
            {task.task.description ? <Text style={styles.taskDescription}>{task.task.description}</Text> : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>THÔNG TIN LIÊN HỆ</Text>
            <View style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <MaterialCommunityIcons name="account-outline" size={22} color={COLORS.onSurfaceVariant} />
              </View>
              <View style={styles.contactTextBlock}>
                <Text style={styles.contactLabel}>Người đại diện</Text>
                <Text style={styles.contactValue}>{outlet?.name || task.task.branch.name}</Text>
              </View>
            </View>

            <View style={styles.contactDivider} />

            <View style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <MaterialCommunityIcons name="phone-outline" size={22} color={COLORS.onSurfaceVariant} />
              </View>
              <View style={styles.contactTextBlock}>
                <Text style={styles.contactLabel}>Số điện thoại</Text>
                <Text style={styles.contactValue}>{outlet?.phone || 'Chưa có số điện thoại'}</Text>
              </View>
              {outlet?.phone ? (
                <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.75}>
                  <MaterialCommunityIcons name="phone" size={20} color={COLORS.onPrimary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeader}>YÊU CẦU CÔNG VIỆC</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>Ưu tiên cao</Text>
              </View>
            </View>

            {template?.checklist && template.checklist.length > 0 ? (
              template.checklist.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.checklistItem}>
                  <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.checklistText}>{item}</Text>
                </View>
              ))
            ) : (
              <View style={styles.checklistItem}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.checklistText}>Thực hiện đúng hướng dẫn trong mô tả công việc.</Text>
              </View>
            )}

            {note ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  <Text style={styles.noteStrong}>Ghi chú thêm: </Text>
                  {note}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {(isPending || isInProgress) && (
        <View style={[styles.bottomAction, { paddingBottom: insets.bottom || SPACING.md }]}>
          <TouchableOpacity
            style={[styles.actionButton, isInProgress ? styles.actionButtonGreen : styles.actionButtonPrimary]}
            onPress={isInProgress ? handleSubmitReport : handleStartTask}
            activeOpacity={0.78}
            disabled={updateStatus.isPending}
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
    paddingBottom: 104,
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
  mapSection: {
    height: 256,
    backgroundColor: COLORS.surfaceContainer,
    position: 'relative',
    overflow: 'hidden',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#dfe8ef',
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
  },
  mapRoadPrimary: {
    left: -24,
    right: -24,
    top: 96,
    height: 42,
    transform: [{ rotate: '-6deg' }],
  },
  mapRoadSecondary: {
    top: -32,
    bottom: -32,
    left: 132,
    width: 38,
    transform: [{ rotate: '9deg' }],
  },
  mapRoadDiagonal: {
    left: 8,
    right: -16,
    top: 178,
    height: 26,
    transform: [{ rotate: '18deg' }],
  },
  mapBlockOne: {
    position: 'absolute',
    left: 20,
    top: 26,
    width: 92,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#c9dfd1',
  },
  mapBlockTwo: {
    position: 'absolute',
    right: 28,
    bottom: 34,
    width: 112,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#d6d8ef',
  },
  mapPin: {
    position: 'absolute',
    top: 96,
    left: '50%',
    width: 44,
    height: 44,
    marginLeft: -22,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeOverlay: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    minHeight: 72,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeTextBlock: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mapButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  mapButtonDisabled: {
    opacity: 0.45,
  },
  mapButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  priorityBadge: {
    backgroundColor: 'rgba(0,110,28,0.12)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },
  contactDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceVariant,
    marginTop: SPACING.md,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextBlock: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },
  contactValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  checklistText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.onSurface,
  },
  noteBox: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainer,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  noteStrong: {
    color: COLORS.onSurface,
    fontWeight: '700',
    fontStyle: 'normal',
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
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
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
