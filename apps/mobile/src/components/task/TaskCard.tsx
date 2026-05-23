import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/constants';
import StatusChip from '../ui/StatusChip';
import { formatTime } from '../../utils/date';
import type { MyTaskAssignmentDto } from '@fieldapp/shared';

interface TaskCardProps {
  task: MyTaskAssignmentDto;
  onPress: () => void;
  onActionPress: () => void;
}

const TaskCard = ({ task, onPress, onActionPress }: TaskCardProps) => {
  const isInProgress = task.status === 'IN_PROGRESS';
  const isCompleted = task.status === 'COMPLETED' || task.status === 'APPROVED';

  const storeName = task.task.outlet?.name || task.task.title;
  const address = task.task.outlet?.address;
  const startTime = task.task.startTime ? formatTime(task.task.startTime) : null;
  const endTime = task.task.endTime ? formatTime(task.task.endTime) : null;
  const timeSlot = startTime && endTime ? `${startTime} - ${endTime}` : null;

  return (
    <TouchableOpacity
      style={[styles.card, isInProgress && styles.cardInProgress]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={styles.topRow}>
        <View style={styles.infoSection}>
          <Text style={styles.storeName} numberOfLines={2}>
            {storeName}
          </Text>
          {address ? (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.onSurfaceVariant} />
              <Text style={styles.address} numberOfLines={1}>
                {address}
              </Text>
            </View>
          ) : null}
        </View>
        <StatusChip status={task.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        {timeSlot ? (
          <View style={styles.timeRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.onSurfaceVariant} />
            <Text style={styles.timeText}>{timeSlot}</Text>
          </View>
        ) : (
          <View />
        )}

        {!isCompleted ? (
          <TouchableOpacity
            style={[styles.actionButton, isInProgress ? styles.actionButtonOutlined : styles.actionButtonFilled]}
            onPress={onActionPress}
            activeOpacity={0.75}
          >
            <Text style={[styles.actionText, isInProgress ? styles.actionTextOutlined : styles.actionTextFilled]}>
              {isInProgress ? 'Tiếp tục' : 'Bắt đầu'}
            </Text>
            <MaterialCommunityIcons
              name={isInProgress ? 'chevron-right' : 'play'}
              size={18}
              color={isInProgress ? COLORS.primary : COLORS.onPrimary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    borderLeftWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  cardInProgress: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  infoSection: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  actionButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonFilled: {
    backgroundColor: COLORS.primaryContainer,
  },
  actionButtonOutlined: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionTextFilled: {
    color: COLORS.onPrimary,
  },
  actionTextOutlined: {
    color: COLORS.primary,
  },
});
