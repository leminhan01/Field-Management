import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../utils/constants';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import type { Icon } from '@expo/vector-icons/build/createIconSet';

interface TabConfigItem {
  name: string;
  label: string;
  icon: Icon;
  activeIcon: Icon;
  showBadge?: boolean;
}

const TAB_CONFIG: TabConfigItem[] = [
  { name: 'TasksTab', label: 'Nhiệm vụ', icon: 'clipboard-check-outline' as Icon, activeIcon: 'clipboard-check' as Icon },
  { name: 'MapTab', label: 'Bản đồ', icon: 'map-outline' as Icon, activeIcon: 'map' as Icon },
  { name: 'NotificationsTab', label: 'Thông báo', icon: 'bell-outline' as Icon, activeIcon: 'bell' as Icon, showBadge: true },
  { name: 'ProfileTab', label: 'Cá nhân', icon: 'account-outline' as Icon, activeIcon: 'account' as Icon },
];

const BottomNavBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || SPACING.sm }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG.find((t) => t.name === route.name);
          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={[styles.tabContent, isFocused && styles.tabContentActive]}>
                <View>
                  <MaterialCommunityIcons
                    name={isFocused ? config.activeIcon : config.icon}
                    size={24}
                    color={isFocused ? COLORS.onSecondaryContainer : COLORS.onSurfaceVariant}
                  />
                  {config.showBadge && !isFocused && <View style={styles.badge} />}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused && styles.tabLabelActive,
                  ]}
                >
                  {config.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    minWidth: 64,
  },
  tabContentActive: {
    backgroundColor: COLORS.secondaryContainer,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    letterSpacing: 0.05,
  },
  tabLabelActive: {
    color: COLORS.onSecondaryContainer,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
});
