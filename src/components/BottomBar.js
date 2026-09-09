import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const TABS = [
  { key: 'home', label: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { key: 'explore', label: 'Explorar', icon: 'search-outline', activeIcon: 'search' },
  { key: 'donate', label: 'Anunciar', icon: 'add-circle-outline', activeIcon: 'add-circle' },
  { key: 'menu', label: 'Menu', icon: 'menu-outline', activeIcon: 'menu' },
];

export default function BottomBar({ activeTab, onTabPress, onMenuOpen }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <View style={s.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const isMenu = tab.key === 'menu';
        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [s.tab, pressed && s.tabPressed]}
            onPress={() => isMenu ? onMenuOpen?.() : onTabPress?.(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <View style={[s.iconWrap, isActive && s.iconWrapActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.primary : theme.textMuted}
              />
            </View>
            <Text style={[s.label, isActive && s.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    ...shadows.light,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.xs, gap: 3,
  },
  tabPressed: { opacity: 0.7 },
  iconWrap: {
    width: 40, height: 32, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: theme.pinkLight,
  },
  label: {
    fontSize: 10,
    color: theme.textMuted,
    fontWeight: typography.medium,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: typography.bold,
  },
});
