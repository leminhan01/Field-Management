import React, { useState } from 'react';
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
import TopAppBar from '../../components/layout/TopAppBar';
import PhotoCapture from '../../components/photo/PhotoCapture';
import type { PhotoItem } from '../../components/photo/PhotoCapture';
import { COLORS, SPACING } from '../../utils/constants';
import { useMyTaskDetail, useSubmitReport, useUploadReportPhoto } from '../../hooks/useMyTasks';
import { useAuthStore } from '../../stores/auth-store';
import type { ReportSubmitScreenProps } from '../../navigation/types';

const ReportSubmitScreen = ({ route, navigation }: ReportSubmitScreenProps) => {
  const { taskId, assignmentId } = route.params;
  const { data: task } = useMyTaskDetail(taskId);
  const submitReport = useSubmitReport();
  const uploadReportPhoto = useUploadReportPhoto();
  const user = useAuthStore((state) => state.user);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [stockCount, setStockCount] = useState('');
  const [displayCount, setDisplayCount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarText = user?.name?.charAt(0).toUpperCase() || 'U';
  const outlet = task?.task?.outlet;
  const outletName = outlet?.name || task?.task?.title || 'Cửa hàng';
  const outletCode = outlet?.code ? ` - Mã: #${outlet.code}` : '';
  const isBusy = isSubmitting || submitReport.isPending || uploadReportPhoto.isPending;

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const report = await submitReport.mutateAsync({
        taskId,
        assignmentId,
        checklistData: {
          stockCount: Number(stockCount) || 0,
          displayCount: Number(displayCount) || 0,
        },
        photos: [],
        notes: notes.trim() || undefined,
      });

      await Promise.all(
        photos.map((photo) =>
          uploadReportPhoto.mutateAsync({
            reportId: report.id,
            uri: photo.uri,
          }),
        ),
      );

      Alert.alert('Thành công', 'Báo cáo đã được gửi.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo hoặc upload ảnh. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chụp ít nhất 1 ảnh minh chứng.');
      return;
    }

    Alert.alert('Xác nhận', 'Gửi báo cáo công việc?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Gửi', onPress: submit },
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Báo cáo Điểm bán</Text>
            <Text style={styles.headerSubtitle}>
              {outletName}
              {outletCode}
            </Text>
          </View>

          <View style={styles.card}>
            <PhotoCapture photos={photos} onPhotosChange={setPhotos} />
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-bar" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Số liệu kiểm kê</Text>
            </View>

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
                  placeholder="Nhập số lượng..."
                  placeholderTextColor={COLORS.outline}
                  style={styles.input}
                  value={stockCount}
                />
              </View>
            </View>

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
                  placeholder="Nhập số lượng..."
                  placeholderTextColor={COLORS.outline}
                  style={styles.input}
                  value={displayCount}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú thêm (Tùy chọn)</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  multiline
                  onChangeText={setNotes}
                  placeholder="Ghi chú về tình trạng kệ hàng, thái độ khách hàng..."
                  placeholderTextColor={COLORS.outline}
                  style={styles.textArea}
                  value={notes}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isBusy && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isBusy}
            activeOpacity={0.78}
          >
            <MaterialCommunityIcons name="send" size={20} color={COLORS.onPrimary} />
            <Text style={styles.submitButtonText}>
              {isBusy ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ReportSubmitScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 112,
  },
  headerInfo: {
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.onSurface,
    paddingVertical: SPACING.sm,
  },
  textAreaWrapper: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  textArea: {
    flex: 1,
    minHeight: 88,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.onSurface,
    padding: 0,
  },
  submitButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: 26,
    backgroundColor: COLORS.submitGreen,
    marginTop: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
