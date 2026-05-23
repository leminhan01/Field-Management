import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';
import { useAuthStore } from '../../stores/auth-store';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Staff'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <Text style={styles.role}>{user?.role || 'STAFF'}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuText}>Cài đặt</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 12 },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  role: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 2,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 10,
    overflow: 'hidden',
  },
  menuSection: { paddingHorizontal: 16, marginTop: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuText: { fontSize: 16, color: COLORS.textPrimary },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
