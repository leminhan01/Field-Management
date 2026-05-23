import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../../utils/constants';

export interface PhotoItem {
  uri: string;
  id?: string;
  createdAt?: string;
}

interface PhotoCaptureProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

const PhotoCapture = ({ photos, onPhotosChange, maxPhotos = 10 }: PhotoCaptureProps) => {
  const { width } = useWindowDimensions();
  const gridWidth = Math.min(width - SPACING.md * 4, 640);
  const cellSize = Math.max(132, Math.floor((gridWidth - SPACING.sm) / 2));

  const handleCapture = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Giới hạn ảnh', `Tối đa ${maxPhotos} ảnh cho một báo cáo.`);
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền camera để chụp ảnh minh chứng.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onPhotosChange([
        ...photos,
        {
          uri: asset.uri,
          id: asset.assetId ?? asset.uri,
          createdAt: new Date().toISOString(),
        },
      ]);
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
        <MaterialCommunityIcons name="camera-outline" size={22} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
      </View>

      <View style={styles.grid}>
        {photos.map((photo, index) => {
          const capturedAt = photo.createdAt ? new Date(photo.createdAt) : new Date();
          return (
            <View key={photo.id || photo.uri} style={[styles.photoCell, { width: cellSize, height: cellSize }]}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemove(index)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
              <View style={styles.photoOverlay}>
                <Text style={styles.photoTime}>
                  {capturedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - Mặt tiền
                </Text>
              </View>
            </View>
          );
        })}

        {photos.length < maxPhotos ? (
          <TouchableOpacity
            style={[styles.captureButton, { width: cellSize, height: cellSize }]}
            onPress={handleCapture}
            activeOpacity={0.78}
          >
            <MaterialCommunityIcons name="camera-plus" size={34} color={COLORS.primaryContainer} />
            <Text style={styles.captureText}>Chụp ảnh</Text>
            <Text style={styles.captureText}>trưng bày</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.helperText}>Yêu cầu ít nhất 1 ảnh toàn cảnh kệ hàng.</Text>
    </View>
  );
};

export default PhotoCapture;

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoCell: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surfaceVariant,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.58)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  photoTime: {
    color: COLORS.onPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  captureButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  captureText: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.primaryContainer,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },
});
