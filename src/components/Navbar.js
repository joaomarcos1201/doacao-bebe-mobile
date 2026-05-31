import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PLACEHOLDERS = ['Buscar Roupas...', 'Buscar Brinquedos...', 'Buscar Acessórios...'];

export default function Navbar({ user, onLogin, onLogout, onSearch }) {
  const { theme, toggleTheme } = useTheme();
  const [phIndex, setPhIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [history] = useState(['Roupas bebê', 'Carrinho', 'Berço']);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setPhIndex(p => (p + 1) % PLACEHOLDERS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const s = styles(theme);

  return (
    <View style={s.navbar}>
      {/* Logo e ações */}
      <View style={s.topRow}>
        <View style={s.logoRow}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🌸</Text>
          </View>
          <Text style={s.logoText}>Além do Positivo</Text>
        </View>
        <View style={s.actions}>
          <TouchableOpacity onPress={toggleTheme} style={s.iconBtn}>
            <Text style={s.iconBtnText}>{theme.isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          {user ? (
            <>
              <Text style={s.helloText}>Olá, {user.name}!</Text>
              <TouchableOpacity onPress={onLogout} style={[s.authBtn, { backgroundColor: '#e05555' }]}>
                <Text style={s.authBtnText}>Sair</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onLogin} style={[s.authBtn, { backgroundColor: theme.pink }]}>
              <Text style={s.authBtnText}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Barra de busca com lupa interna */}
      <View style={s.inputWrap}>
        <Text style={s.inputIcon}>🔍</Text>
        <TextInput
          style={s.input}
          value={search}
          onChangeText={setSearch}
          onFocus={() => { setFocused(true); onSearch?.(''); }}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholderTextColor="transparent"
        />
        {!search && (
          <Animated.Text style={[s.placeholder, { opacity: fadeAnim }]} pointerEvents="none">
            {PLACEHOLDERS[phIndex]}
          </Animated.Text>
        )}
        {focused && history.length > 0 && (
          <View style={[s.historyDropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {history.map((h, i) => (
              <TouchableOpacity key={i} onPress={() => { onSearch?.(h); setFocused(false); }} style={s.historyItem}>
                <Text style={{ color: theme.textMuted, fontSize: 13 }}>🕐  {h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  navbar: {
    backgroundColor: theme.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 10,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: '#e8a0a8',
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 16 },
  logoText: { color: theme.pink, fontWeight: '700', fontSize: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4 },
  iconBtnText: { fontSize: 20 },
  helloText: { color: theme.text, fontSize: 12 },
  authBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  authBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 12, fontSize: 14, zIndex: 1 },
  input: {
    backgroundColor: theme.bgSecondary, borderRadius: 10,
    paddingHorizontal: 36, paddingVertical: 8,
    borderWidth: 1, borderColor: theme.border,
    color: theme.text, fontSize: 13,
  },
  placeholder: { position: 'absolute', left: 36, color: theme.textMuted, fontSize: 13 },
  historyDropdown: {
    position: 'absolute', top: 40, left: 0, right: 0,
    borderRadius: 10, borderWidth: 1, zIndex: 999, elevation: 10,
  },
  historyItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
});
