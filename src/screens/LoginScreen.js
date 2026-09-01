import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ onBack, onRegister, onForgotPassword, onLoginSuccess }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Informe seu email e sua senha.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onLoginSuccess?.(email, password);
    } catch (err) {
      setError(err.message || 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtnText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={s.card}>
          {/* Logo */}
          <View style={s.logoCircle} />
          <Text style={s.title}>Além do Positivo</Text>
          <Text style={s.subtitle}>Faça login para continuar</Text>

          {/* Campos */}
          <View style={s.fields}>
            <View style={s.fieldGroup}>
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
            <View style={s.fieldGroup}>
              <Text style={s.label}>Senha</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          {/* Botão entrar */}
          <TouchableOpacity
            style={[s.loginBtn, loading && s.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.loginBtnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>
          {!!error && <Text style={s.errorText}>{error}</Text>}

          {/* Links */}
          <TouchableOpacity onPress={onRegister} activeOpacity={0.7}>
            <Text style={s.registerLink}>
              Não tem conta? <Text style={s.registerLinkBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
            <Text style={s.forgotLink}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  backBtn: { position: 'absolute', top: 16, left: 20 },
  backBtnText: { color: theme.pink, fontSize: 15, fontWeight: '600' },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: '#e8a0a8',
    backgroundColor: 'rgba(232,96,122,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 30 },
  title: { fontSize: 20, fontWeight: '800', color: theme.pink, marginBottom: 4 },
  subtitle: { fontSize: 13, color: theme.textMuted, marginBottom: 28 },
  fields: { width: '100%', gap: 16, marginBottom: 24 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text },
  input: {
    backgroundColor: theme.isDark ? '#1a1a1a' : '#fdf0f2',
    borderWidth: 1,
    borderColor: theme.isDark ? '#333' : '#e8d0d4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.text,
  },
  loginBtn: {
    backgroundColor: theme.pink,
    width: '100%', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  registerLink: { fontSize: 13, color: theme.textMuted, marginBottom: 10 },
  registerLinkBold: { color: theme.pink, fontWeight: '700' },
  forgotLink: { fontSize: 13, color: theme.textMuted },
  errorText: { color: '#c44150', fontSize: 13, textAlign: 'center', marginBottom: 12 },
});
