import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.version}>FieldApp Staff v1.0.0</Text>
        <Text style={styles.info}>Môi trường: Development</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  version: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' },
  info: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});
