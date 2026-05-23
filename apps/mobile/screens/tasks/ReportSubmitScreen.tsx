import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../utils/constants';
import apiClient from '../../services/api';

export default function ReportSubmitScreen({ route, navigation }: any) {
  const { taskId, assignmentId } = route.params || {};
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 10));
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 10));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!taskId || !assignmentId) {
      Alert.alert('Lỗi', 'Thiếu thông tin công việc');
      return;
    }

    setSubmitting(true);
    try {
      // Upload photos first
      const uploadedUrls: string[] = [];
      for (const uri of photos) {
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);

        const { data } = await apiClient.post(
          `/me/reports/temp-upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        if (data?.data?.url) uploadedUrls.push(data.data.url);
      }

      // Submit report
      await apiClient.post('/me/reports', {
        taskId,
        assignmentId,
        checklistData: {},
        photos: uploadedUrls,
        notes: notes || undefined,
        rating: rating || undefined,
      });

      // Update assignment status
      await apiClient.patch(`/me/task-assignments/${assignmentId}/status`, {
        status: 'COMPLETED',
      });

      Alert.alert('Thành công', 'Đã gửi báo cáo', [
        { text: 'OK', onPress: () => navigation.navigate('TaskList') },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh minh chứng ({photos.length}/10)</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoLabel}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoLabel}>Thư viện</Text>
            </TouchableOpacity>
            {photos.map((uri, idx) => (
              <View key={idx} style={styles.photoItem}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePhoto(idx)}
                >
                  <Text style={styles.removeBtnText}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Nhập ghi chú về công việc..."
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text
                  style={[
                    styles.star,
                    rating >= star && styles.starActive,
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: { fontSize: 24, color: COLORS.textSecondary },
  addPhotoLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  photoItem: { position: 'relative' },
  photo: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  ratingRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 32, color: COLORS.border },
  starActive: { color: COLORS.warning },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
