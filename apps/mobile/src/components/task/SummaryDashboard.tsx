import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';

interface SummaryDashboardProps {
  completed: number;
  total: number;
}

const SummaryDashboard = ({ completed, total }: SummaryDashboardProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.grid}>
      <View style={styles.card}>
        <Text style={styles.label}>HOÀN THÀNH</Text>
        <Text style={[styles.value, { color: COLORS.secondary }]}>
          {completed}/{total}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>TIẾN ĐỘ</Text>
        <Text style={[styles.value, { color: COLORS.primary }]}>{percentage}%</Text>
      </View>
    </View>
  );
};

export default SummaryDashboard;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    borderRadius: 12,
    padding: SPACING.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.08,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
});
