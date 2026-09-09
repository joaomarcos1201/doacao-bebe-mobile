import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export default function ScreenHeader({ title, onBack, backLabel = 'Voltar', right }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.side, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
      >
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[styles.back, { color: colors.primary }]}>{backLabel}</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.textTitle }]} numberOfLines={1}>{title}</Text>

      {right || (
        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [styles.side, styles.sideRight, pressed && { opacity: 0.7 }]}
        >
          <Ionicons
            name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={theme.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    ...shadows.light,
  },
  side: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    minWidth: 70, minHeight: 44, justifyContent: 'flex-start',
  },
  sideRight: { justifyContent: 'flex-end' },
  back: {
    fontSize: typography.label,
    fontWeight: typography.bold,
  },
  title: {
    flex: 1, textAlign: 'center',
    fontSize: typography.navTitle,
    fontWeight: typography.extrabold,
    letterSpacing: -0.3,
  },
});
