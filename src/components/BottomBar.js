import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { key: 'home', label: 'Início', icon: '🏠' },
  { key: 'explore', label: 'Explorar', icon: '🔍' },
  { key: 'donate', label: 'Anunciar', icon: '🎁' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'menu', label: 'Menu', icon: '☰' },
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
          <TouchableOpacity
            key={tab.key}
            style={s.tab}
            onPress={() => isMenu ? onMenuOpen?.() : onTabPress?.(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[s.icon, isActive && s.iconActive]}>{tab.icon}</Text>
            <Text style={[s.label, isActive && s.labelActive]}>{tab.label}</Text>
            {isActive && <View style={s.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.bg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, gap: 2, position: 'relative',
  },
  icon: { fontSize: 22 },
  iconActive: {},
  label: { fontSize: 10, color: theme.textMuted, fontWeight: '500' },
  labelActive: { color: theme.pink, fontWeight: '700' },
  activeDot: {
    position: 'absolute', bottom: -4,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: theme.pink,
  },
});
