import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FieldApp Staff',
  slug: 'fieldapp-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.fieldapp.staff',
    infoPlist: {
      NSCameraUsageDescription:
        'FieldApp cần truy cập camera để chụp ảnh minh chứng cho báo cáo công việc.',
      NSLocationWhenInUseUsageDescription:
        'FieldApp cần vị trí của bạn để check-in tại cửa hàng và tìm cửa hàng gần bạn.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'FieldApp cần vị trí của bạn để check-in tại cửa hàng và tìm cửa hàng gần bạn.',
    },
  },
  android: {
    usesCleartextTraffic: true,
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#2563EB',
    },
    package: 'com.fieldapp.staff',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
    ],
  },
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.8:3001/api/v1',
    checkinRadius: parseInt(process.env.EXPO_PUBLIC_CHECKIN_RADIUS || '200', 10),
    maxPhotosPerReport: parseInt(process.env.EXPO_PUBLIC_MAX_PHOTOS_PER_REPORT || '10', 10),
    photoMaxSize: parseInt(process.env.EXPO_PUBLIC_PHOTO_MAX_SIZE || '5242880', 10),
    photoQuality: parseFloat(process.env.EXPO_PUBLIC_PHOTO_QUALITY || '0.8'),
    syncInterval: parseInt(process.env.EXPO_PUBLIC_SYNC_INTERVAL || '300', 10),
    eas: {
      projectId: '2ea39bbd-74b2-4ca5-9167-29536f5f8cd9',
    },
  },
  plugins: [
    'expo-camera',
    'expo-location',
    'expo-notifications',
    'expo-local-authentication',
  ],
});
