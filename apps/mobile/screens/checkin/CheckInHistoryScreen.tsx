import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';
import { useCheckInHistory } from '../../hooks/useCheckIn';
import { formatDateTime } from '../../utils/date';
import { formatDistance } from '../../utils/distance';

export default function CheckInHistoryScreen() {
  const { data, isLoading } = useCheckInHistory();
  const checkIns = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={checkIns}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.card}>
            <Text style={styles.outletName}>
              {item.outlet?.name || 'Cửa hàng'}
            </Text>
            {item.outlet?.address && (
              <Text style={styles.address}>{item.outlet.address}</Text>
            )}
            <View style={styles.meta}>
              <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
              {item.distance != null && (
                <Text style={styles.distance}>
                  Khoảng cách: {formatDistance(item.distance)}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có lịch sử check-in</Text>
        }
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingHorizontal: 16, paddingTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  outletName: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  address: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  time: { fontSize: 12, color: COLORS.textSecondary },
  distance: { fontSize: 12, color: COLORS.accent },
  empty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
