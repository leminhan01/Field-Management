import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../../utils/constants';

export interface PhotoItem {
  uri: string;
  id?: string;
}

interface PhotoCaptureProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

const PhotoCapture = ({ photos, onPhotosChange, maxPhotos = 10 }: PhotoCaptureProps) => {
  const handleCapture = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Giới hạn', `Tối đa ${maxPhotos} ảnh.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền camera để chụp ảnh.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotosChange([...photos, { uri: result.assets[0].uri }]);
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onPhotosChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="camera-outline" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Ảnh Minh Chứng</Text>
      </View>

      <View style={styles.grid}>
        {photos.map((photo, index) => (
          <View key={photo.id || index} style={styles.photoCell}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemove(index)}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
            </TouchableOpacity>
            <View style={styles.photoOverlay}>
              <MaterialCommunityIcons name="clock-outline" size={10} color="#fff" />
              <Text style={styles.photoTime}>
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture} activeOpacity={0.7}>
            <MaterialCommunityIcons name="camera-plus-outline" size={32} color={COLORS.primaryContainer} />
            <Text style={styles.captureText}>Chụp Ảnh</Text>
            <Text style={styles.captureText}>Trưng Bày</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.helperText}>Yêu cầu ít nhất 1 ảnh toàn cảnh kệ hàng.</Text>
    </View>
  );
};

export default PhotoCapture;

const CELL_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoTime: {
    color: '#fff',
    fontSize: 10,
  },
  captureButton: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  captureText: {
    fontSize: 12,
    color: COLORS.primaryContainer,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.sm,
  },
});
