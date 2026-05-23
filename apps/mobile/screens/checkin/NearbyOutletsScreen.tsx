import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';
import { useNearbyOutlets } from '../../hooks/useCheckIn';
import { useLocation } from '../../hooks/useLocation';
import { formatDistance } from '../../utils/distance';

export default function NearbyOutletsScreen({ navigation }: any) {
  const { location } = useLocation();
  const { data: outlets, isLoading } = useNearbyOutlets(
    location?.latitude ?? null,
    location?.longitude ?? null,
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={outlets || []}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('CheckIn', { outletId: item.id })
            }
          >
            <View style={styles.cardInfo}>
              <Text style={styles.outletName}>{item.name}</Text>
              <Text style={styles.address}>{item.address || 'Chưa có địa chỉ'}</Text>
              <Text style={styles.branchName}>
                {item.branch?.name || ''}
              </Text>
            </View>
            <Text style={styles.distance}>
              {formatDistance(item.distance)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {location ? 'Không tìm thấy cửa hàng gần đây' : 'Đang lấy vị trí...'}
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardInfo: { flex: 1 },
  outletName: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  address: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  branchName: { fontSize: 12, color: COLORS.accent, marginTop: 2 },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  empty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
