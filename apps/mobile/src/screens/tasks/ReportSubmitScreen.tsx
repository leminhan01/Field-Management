import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopAppBar from '../../components/layout/TopAppBar';
import PhotoCapture from '../../components/photo/PhotoCapture';
import type { PhotoItem } from '../../components/photo/PhotoCapture';
import { COLORS, SPACING } from '../../utils/constants';
import { useMyTaskDetail, useSubmitReport } from '../../hooks/useMyTasks';
import { useAuthStore } from '../../stores/auth-store';
import type { ReportSubmitScreenProps } from '../../navigation/types';

const ReportSubmitScreen = ({ route, navigation }: ReportSubmitScreenProps) => {
  const { taskId, assignmentId } = route.params;
  const { data: task } = useMyTaskDetail(taskId);
  const submitReport = useSubmitReport();
  const user = useAuthStore((s) => s.user);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [stockCount, setStockCount] = useState('');
  const [displayCount, setDisplayCount] = useState('');
  const [notes, setNotes] = useState('');

  const avatarText = user?.name?.charAt(0).toUpperCase() || 'U';
  const outletName = task?.task?.outlet?.name || task?.task?.title || 'Cửa hàng';

  const handleSubmit = () => {
    if (photos.length === 0) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chụp ít nhất 1 ảnh minh chứng.');
      return;
    }

    Alert.alert('Xác nhận', 'Gửi báo cáo công việc?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Gửi',
        onPress: () => {
          submitReport.mutate(
            {
              taskId,
              assignmentId,
              checklistData: {
                stockCount: Number(stockCount) || 0,
                displayCount: Number(displayCount) || 0,
              },
              photos: photos.map((p) => p.uri),
              notes: notes.trim() || undefined,
            },
            {
              onSuccess: () => {
                Alert.alert('Thành công', 'Báo cáo đã được gửi.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              },
              onError: () => {
                Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
              },
            },
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.outer}>
      <TopAppBar
        title="Điều hành Hiện trường"
        showBackButton
        onBackPress={() => navigation.goBack()}
        avatarText={avatarText}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Báo cáo Điểm bán</Text>
          <Text style={styles.headerSubtitle}>{outletName}</Text>
        </View>

        {/* Photo section */}
        <View style={styles.card}>
          <PhotoCapture photos={photos} onPhotosChange={setPhotos} />
        </View>

        {/* Data entry section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-bar" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Số liệu Kiểm kê</Text>
          </View>

          {/* Stock count */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số lượng hàng tồn (Thùng)</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={20}
                color={COLORS.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                keyboardType="number-pad"
                onChangeText={setStockCount}
                placeholder="0"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                value={stockCount}
              />
            </View>
          </View>

          {/* Display count */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số mặt hàng trưng bày (Mặt)</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={20}
                color={COLORS.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                keyboardType="number-pad"
                onChangeText={setDisplayCount}
                placeholder="0"
                placeholderTextColor={COLORS.outline}
                style={styles.input}
                value={displayCount}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ghi chú thêm (Tùy chọn)</Text>
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="Nhập ghi chú..."
              placeholderTextColor={COLORS.outline}
              style={[styles.input, styles.textArea]}
              value={notes}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, submitReport.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitReport.isPending}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="send" size={20} color={COLORS.onPrimary} />
          <Text style={styles.submitButtonText}>
            {submitReport.isPending ? 'Đang gửi...' : 'Gửi Báo Cáo'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ReportSubmitScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerInfo: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
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
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.submitGreen,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
