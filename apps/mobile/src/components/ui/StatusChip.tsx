import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

interface StatusChipProps {
  status: string;
}

const StatusChip = ({ status }: StatusChipProps) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  const label = STATUS_LABELS[status] || status;

  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

export default StatusChip;

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
