import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export default function LoginScreen({ onBack, onRegister, onForgotPassword, onLoginSuccess }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
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
        {onBack && (
          <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={onBack}>
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
            <Text style={s.backText}>Voltar</Text>
          </Pressable>
        )}

        <View style={s.card}>
          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoCircle}>
              <Ionicons name="heart" size={28} color={colors.primary} />
            </View>
          </View>
          <Text style={s.brand}>Além do Positivo</Text>
          <Text style={s.subtitle}>Faça login para continuar</Text>

          {/* Campos */}
          <View style={s.fields}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>Email</Text>
              <View style={[s.inputWrap, emailFocused && s.inputWrapFocused]}>
                <Ionicons name="mail-outline" size={16} color={emailFocused ? colors.primary : theme.textMuted} />
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Senha</Text>
              <View style={[s.inputWrap, passFocused && s.inputWrapFocused]}>
                <Ionicons name="lock-closed-outline" size={16} color={passFocused ? colors.primary : theme.textMuted} />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textPlaceholder}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <Pressable onPress={() => setShowPassword(p => !p)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color={theme.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [s.loginBtn, loading && s.loginBtnDisabled, pressed && { opacity: 0.85 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <Ionicons name="reload-outline" size={18} color="#fff" />
              : <Text style={s.loginBtnText}>Entrar</Text>
            }
          </Pressable>

          <View style={s.links}>
            <Pressable onPress={onRegister}>
              <Text style={s.linkText}>
                Não tem conta? <Text style={s.linkBold}>Cadastre-se</Text>
              </Text>
            </Pressable>
            <Pressable onPress={onForgotPassword}>
              <Text style={s.forgotText}>Esqueci minha senha</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: spacing.xl,
  },
  backText: { color: colors.primary, fontSize: typography.button, fontWeight: typography.bold },
  card: {
    backgroundColor: theme.card,
    borderRadius: radius.xxl,
    padding: spacing.xxxl,
    alignItems: 'center',
    ...shadows.strong,
  },
  logoWrap: { marginBottom: spacing.md },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: colors.primaryMedium,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  brand: {
    fontSize: typography.authTitle,
    fontWeight: typography.extrabold,
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { fontSize: typography.label, color: theme.textMuted, marginBottom: spacing.xxl },
  fields: { width: '100%', gap: spacing.lg, marginBottom: spacing.xl },
  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.label, fontWeight: typography.semibold, color: theme.text },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input,
    borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  inputWrapFocused: { borderColor: colors.primary },
  input: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.errorBg,
    borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    width: '100%', marginBottom: spacing.md,
  },
  errorText: { color: colors.errorText, fontSize: typography.label, flex: 1 },
  loginBtn: {
    backgroundColor: colors.primary,
    width: '100%', paddingVertical: 15,
    borderRadius: radius.md, alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.cta,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.button },
  links: { alignItems: 'center', gap: spacing.sm },
  linkText: { fontSize: typography.label, color: theme.textMuted },
  linkBold: { color: colors.primary, fontWeight: typography.bold },
  forgotText: { fontSize: typography.label, color: theme.textMuted },
});
