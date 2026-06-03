import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopAppBar from '../../components/layout/TopAppBar';
import { COLORS, SPACING } from '../../utils/constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TaskStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TaskStackParamList, 'SurveyConfirmation'>;

const SurveyConfirmationScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.outer}>
      <TopAppBar title="Khảo sát" showBackButton={false} />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="check-circle" size={64} color={COLORS.success} />
        </View>

        <Text style={styles.title}>Gửi thành công!</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã hoàn thành khảo sát.{'\n'}
          Phản hồi của bạn đã được ghi nhận.
        </Text>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('TaskList')}
          activeOpacity={0.78}
        >
          <MaterialCommunityIcons name="home-outline" size={20} color={COLORS.onPrimary} />
          <Text style={styles.homeButtonText}>Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.surveyListButton}
          onPress={() => navigation.navigate('SurveyList')}
          activeOpacity={0.78}
        >
          <Text style={styles.surveyListText}>Tiếp tục khảo sát</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SurveyConfirmationScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
  homeButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  homeButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  surveyListButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surveyListText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
