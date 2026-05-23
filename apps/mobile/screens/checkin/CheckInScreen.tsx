import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';
import { useLocation } from '../../hooks/useLocation';
import { useCheckIn } from '../../hooks/useCheckIn';
import { formatDistance } from '../../utils/distance';
import { haversineDistance } from '../../utils/distance';

export default function CheckInScreen({ route, navigation }: any) {
  const { outletId, assignmentId } = route.params || {};
  const { location, isLoading: locationLoading, errorMsg } = useLocation();
  const checkIn = useCheckIn();

  const handleCheckIn = async () => {
    if (!location || !outletId) return;

    try {
      await checkIn.mutateAsync({
        outletId,
        assignmentId,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      Alert.alert('Thành công', 'Check-in thành công!');
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Check-in thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Check-in tại cửa hàng</Text>

        {locationLoading ? (
          <Text style={styles.loadingText}>Đang lấy vị trí...</Text>
        ) : errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : location ? (
          <View style={styles.locationInfo}>
            <Text style={styles.coordsText}>
              Vị trí: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            {location.accuracy && (
              <Text style={styles.accuracyText}>
                Độ chính xác: {formatDistance(location.accuracy)}
              </Text>
            )}
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.historyButton]}
          onPress={() => navigation.navigate('CheckInHistory')}
        >
          <Text style={styles.historyButtonText}>Xem lịch sử check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.historyButton]}
          onPress={() => navigation.navigate('NearbyOutlets')}
        >
          <Text style={styles.historyButtonText}>Tìm cửa hàng gần đây</Text>
        </TouchableOpacity>

        {outletId && (
          <TouchableOpacity
            style={[
              styles.checkInButton,
              (!location || checkIn.isPending) && styles.buttonDisabled,
            ]}
            onPress={handleCheckIn}
            disabled={!location || checkIn.isPending}
          >
            <Text style={styles.checkInButtonText}>
              {checkIn.isPending ? 'Đang check-in...' : 'Check-in'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  locationInfo: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  coordsText: { fontSize: 14, color: COLORS.textPrimary },
  accuracyText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 24 },
  errorText: { fontSize: 14, color: COLORS.error, textAlign: 'center', paddingVertical: 24 },
  historyButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  historyButtonText: { color: COLORS.primary, fontWeight: '500' },
  checkInButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  checkInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
