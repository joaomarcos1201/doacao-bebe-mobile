import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export default function EmptyState({ iconName = 'heart-outline', title, message }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.pinkLight }]}>
        <Ionicons name={iconName} size={32} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxxl,
    gap: spacing.sm,
    margin: spacing.lg,
    ...shadows.light,
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.cardTitle,
    fontWeight: typography.extrabold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
