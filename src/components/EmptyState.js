import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';

export default function EmptyState({ icon = '♡', title, message }) {
  const { theme } = useTheme();
  return <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={[styles.icon, { color: theme.pink }]}>{icon}</Text><Text style={[styles.title, { color: theme.text }]}>{title}</Text>{message && <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>}</View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: spacing.xxl, gap: spacing.sm }, icon: { fontSize: 42 }, title: { fontSize: typography.cardTitle, fontWeight: '800', textAlign: 'center' }, message: { fontSize: typography.body, textAlign: 'center', lineHeight: 20 }, });
