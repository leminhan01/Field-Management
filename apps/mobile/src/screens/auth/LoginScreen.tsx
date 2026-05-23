import React, { useState } from 'react';
import axios from 'axios';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../utils/constants';
import { useAuthStore } from '../../stores/auth-store';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Vui lòng kiểm tra lại tài khoản hoặc kết nối mạng.';

      Alert.alert('Đăng nhập thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.outer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <MaterialCommunityIcons name="briefcase-outline" size={32} color={COLORS.onPrimary} />
              </View>
              <Text style={styles.appName}>Field Force</Text>
              <Text style={styles.subtitle}>Đăng nhập để bắt đầu phiên làm việc</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email / Số điện thoại</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color={COLORS.onSurfaceVariant}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="email@example.com"
                    placeholderTextColor={COLORS.outline}
                    style={styles.input}
                    value={email}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={COLORS.onSurfaceVariant}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    onChangeText={setPassword}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={COLORS.outline}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {/* Login button */}
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isSubmitting}
                onPress={handleLogin}
                style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
              >
                <Text style={styles.loginButtonText}>
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Text>
                {!isSubmitting && (
                  <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.onPrimary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    paddingVertical: SPACING.sm,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primaryContainer,
    marginTop: SPACING.sm,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
