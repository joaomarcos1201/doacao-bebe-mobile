import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';

export default function ScreenHeader({ title, onBack, backLabel = 'Voltar', right }) {
  const { theme, toggleTheme } = useTheme();
  return <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
    <TouchableOpacity onPress={onBack} style={styles.side} activeOpacity={0.7}><Text style={[styles.back, { color: theme.pink }]}>{`← ${backLabel}`}</Text></TouchableOpacity>
    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
    {right || <TouchableOpacity onPress={toggleTheme} style={styles.side} activeOpacity={0.7}><Text style={styles.theme}>{theme.isDark ? '☀️' : '🌙'}</Text></TouchableOpacity>}
  </View>;
}

const styles = StyleSheet.create({
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, borderBottomWidth: 1 },
  side: { minWidth: 70, minHeight: 44, justifyContent: 'center' },
  back: { fontSize: typography.body, fontWeight: '700' },
  title: { flex: 1, textAlign: 'center', fontSize: typography.cardTitle, fontWeight: '800' },
  theme: { fontSize: 20, textAlign: 'right' },
});
