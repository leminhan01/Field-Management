import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const ScreenShell = ({ title, subtitle, children }: ScreenShellProps) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
};

export default ScreenShell;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.onSurface,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
});
