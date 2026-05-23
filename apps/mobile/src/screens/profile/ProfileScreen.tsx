import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import ScreenShell from '../../components/layout/ScreenShell';
import { useAuthStore } from '../../stores/auth-store';
import { COLORS, SPACING } from '../../utils/constants';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <ScreenShell title="Cá nhân" subtitle={user?.name ?? 'Thông tin tài khoản'}>
      <Text style={styles.text}>{user?.email ?? 'Chưa có email'}</Text>
      <Text style={styles.text}>{user?.phone ?? 'Chưa có số điện thoại'}</Text>
      <Text style={styles.text}>{user?.role ?? 'Chưa có role'}</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={logout} style={styles.button}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  text: {
    marginBottom: SPACING.md,
    color: COLORS.onSurface,
    fontSize: 14,
  },
  button: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.error,
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
