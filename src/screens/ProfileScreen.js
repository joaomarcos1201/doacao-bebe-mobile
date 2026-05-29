import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const checks = [
  { label: 'Letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Caractere especial', test: (p) => /[^a-zA-Z0-9]/.test(p) },
  { label: 'Número', test: (p) => /[0-9]/.test(p) },
];

const TIPS = [
  'Use uma senha forte com pelo menos 8 caracteres',
  'Mantenha suas informações sempre atualizadas',
  'Nunca compartilhe sua senha com outras pessoas',
];

export default function ProfileScreen({ onBack, user }) {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const s = styles(theme);

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Navbar */}
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
          <Text style={s.themeBtn}>{theme.isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarInitial}>{initial}</Text>
          </View>
          <Text style={s.avatarName}>{name || 'Usuário'}</Text>
          <Text style={s.avatarEmail}>{email || 'sem email'}</Text>
        </View>

        {/* Card dados pessoais */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Dados Pessoais</Text>
          <View style={s.row}>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Nome</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="words"
              />
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Seção alterar senha */}
          <View style={s.passwordSection}>
            <Text style={s.passwordSectionTitle}>Alterar Senha</Text>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Senha atual</Text>
              <TextInput
                style={s.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>

            <View style={s.row}>
              <View style={[s.fieldGroup, s.flex1]}>
                <Text style={s.label}>Nova senha</Text>
                <TextInput
                  style={s.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                />
                {newPassword.length > 0 && (
                  <View style={s.passwordChecks}>
                    {checks.map((c) => {
                      const ok = c.test(newPassword);
                      return (
                        <View key={c.label} style={s.checkRow}>
                          <Text style={[s.checkIcon, { color: ok ? '#3aaa6e' : '#e05555' }]}>
                            {ok ? '✓' : '✗'}
                          </Text>
                          <Text style={[s.checkLabel, { color: ok ? '#3aaa6e' : '#e05555' }]}>
                            {c.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
              <View style={[s.fieldGroup, s.flex1]}>
                <Text style={s.label}>Confirmar senha</Text>
                <TextInput
                  style={[
                    s.input,
                    confirmPassword.length > 0 && {
                      borderColor: confirmPassword === newPassword ? '#3aaa6e' : '#e05555',
                    },
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                />
                {confirmPassword.length > 0 && (
                  <Text style={{ fontSize: 11, color: confirmPassword === newPassword ? '#3aaa6e' : '#e05555', marginTop: 4 }}>
                    {confirmPassword === newPassword ? '✓ Senhas coincidem' : '✗ Senhas diferentes'}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[s.saveBtn, loading && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.saveBtnText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
          </TouchableOpacity>
        </View>

        {/* Card dicas de segurança */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Dicas de Segurança</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipNum}>
                <Text style={s.tipNumText}>{i + 1}</Text>
              </View>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' },

  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: { color: theme.pink, fontSize: 15, fontWeight: '600' },
  navTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  themeBtn: { fontSize: 20 },

  scroll: { padding: 16, gap: 16 },

  // Avatar
  avatarSection: { alignItems: 'center', paddingVertical: 8, gap: 6 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.pink,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.pink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '700' },
  avatarName: { fontSize: 18, fontWeight: '700', color: theme.text },
  avatarEmail: { fontSize: 13, color: theme.textMuted },

  // Card
  card: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    gap: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },

  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text },
  input: {
    backgroundColor: theme.isDark ? '#1a1a1a' : '#fdf0f2',
    borderWidth: 1, borderColor: theme.isDark ? '#333' : '#e8d0d4',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: theme.text,
  },

  // Seção senha
  passwordSection: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(232,96,122,0.04)',
    borderRadius: 14, padding: 16, gap: 12,
    borderWidth: 1, borderColor: theme.border,
  },
  passwordSectionTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
  passwordChecks: { marginTop: 6, gap: 3 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  checkIcon: { fontSize: 12, fontWeight: '700' },
  checkLabel: { fontSize: 11 },

  // Botão salvar
  saveBtn: {
    backgroundColor: theme.pink, paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
    shadowColor: theme.pink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Dicas
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: theme.pink, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tipNumText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  tipText: { flex: 1, fontSize: 13, color: theme.textMuted, lineHeight: 20, paddingTop: 3 },
});
