import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const PLACEHOLDERS = ['Buscar Roupas...', 'Buscar Brinquedos...', 'Buscar Acessórios...'];
const HISTORY = ['Roupas de bebê', 'Brinquedos', 'Berço', 'Carrinho', 'Acessórios'];

export default function Navbar({ user, onLogin, onLogout, onSearch }) {
  const { theme, toggleTheme } = useTheme();
  const [phIndex, setPhIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const s = styles(theme);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setPhIndex(p => (p + 1) % PLACEHOLDERS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (search.trim()) { onSearch?.(search.trim()); setFocused(false); }
  };

  return (
    <View style={s.navbar}>
      <View style={s.topRow}>
        <View style={s.logoRow}>
          <View style={s.logoCircle}>
            <Ionicons name="heart" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={s.logoText}>Além do Positivo</Text>
            <Text style={s.logoTagline}>Conectando famílias</Text>
          </View>
        </View>
        <View style={s.actions}>
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [s.iconBtn, pressed && s.iconBtnPressed]}
          >
            <Ionicons
              name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={theme.textMuted}
            />
          </Pressable>
          {user ? (
            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [s.authBtn, s.authBtnOutline, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="log-out-outline" size={14} color={colors.primary} />
              <Text style={s.authBtnOutlineText}>Sair</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onLogin}
              style={({ pressed }) => [s.authBtn, s.authBtnFilled, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.authBtnFilledText}>Entrar</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Barra de busca pill */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color={focused ? colors.primary : colors.primaryMedium} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          onFocus={() => { setFocused(true); }}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          placeholderTextColor="transparent"
        />
        {!search && (
          <Animated.Text style={[s.searchPlaceholder, { opacity: fadeAnim }]} pointerEvents="none">
            {PLACEHOLDERS[phIndex]}
          </Animated.Text>
        )}
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Dropdown histórico */}
      {focused && (
        <View style={[s.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {HISTORY.map((h, i) => (
            <Pressable
              key={i}
              onPress={() => { onSearch?.(h); setSearch(h); setFocused(false); }}
              style={({ pressed }) => [s.dropdownItem, pressed && s.dropdownItemPressed, i < HISTORY.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            >
              <Ionicons name="time-outline" size={14} color={theme.textMuted} />
              <Text style={[s.dropdownText, { color: theme.textMuted }]}>{h}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  navbar: {
    backgroundColor: theme.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: spacing.sm,
    zIndex: 100,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: colors.primaryMedium,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    color: colors.primary,
    fontWeight: typography.extrabold,
    fontSize: typography.navTitle,
    letterSpacing: -0.3,
  },
  logoTagline: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: typography.medium,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.pinkSurface,
  },
  iconBtnPressed: { opacity: 0.7 },
  authBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.pill,
  },
  authBtnFilled: {
    backgroundColor: colors.primary,
    ...shadows.cta,
  },
  authBtnOutline: {
    borderWidth: 1.5, borderColor: colors.primary,
  },
  authBtnFilledText: { color: '#fff', fontSize: typography.label, fontWeight: typography.bold },
  authBtnOutlineText: { color: colors.primary, fontSize: typography.label, fontWeight: typography.bold },

  // Search pill
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.isDark ? theme.input : 'rgba(255,255,255,0.9)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: theme.isDark ? theme.inputBorder : 'rgba(232,138,162,0.25)',
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchIcon: {},
  searchInput: {
    flex: 1, fontSize: typography.label,
    color: theme.text, paddingVertical: 0,
  },
  searchPlaceholder: {
    position: 'absolute', left: 44,
    color: theme.textMuted, fontSize: typography.label,
    pointerEvents: 'none',
  },

  // Dropdown
  dropdown: {
    position: 'absolute', top: 108, left: spacing.lg, right: spacing.lg,
    borderRadius: radius.md, borderWidth: 1,
    zIndex: 999, elevation: 12,
    ...shadows.medium,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  dropdownItemPressed: { backgroundColor: theme.pinkSurface },
  dropdownText: { fontSize: typography.label },
});
