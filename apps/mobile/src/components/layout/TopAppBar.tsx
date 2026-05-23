import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../utils/constants';

interface TopAppBarProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  avatarText?: string;
  rightAction?: React.ReactNode;
}

const TopAppBar = ({
  title,
  showBackButton = false,
  onBackPress,
  showMenuButton = false,
  onMenuPress,
  avatarText,
  rightAction,
}: TopAppBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {showBackButton ? (
            <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          ) : showMenuButton ? (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
              <MaterialCommunityIcons name="menu" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.right}>
          {rightAction ||
            (avatarText ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarText}</Text>
              </View>
            ) : null)}
        </View>
      </View>
    </View>
  );
};

export default TopAppBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '600',
  },
});
