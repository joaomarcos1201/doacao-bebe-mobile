import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const maskCPF = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const checks = [
  { label: 'Letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Caractere especial', test: (p) => /[^a-zA-Z0-9]/.test(p) },
  { label: 'Número', test: (p) => /[0-9]/.test(p) },
];

export default function RegisterScreen({ onBack, onLoginRedirect, onRegister }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || cpf.replace(/\D/g, '').length !== 11 || !password) {
      setError('Preencha nome, email, CPF e senha corretamente.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[^a-zA-Z0-9]/.test(password) || !/[0-9]/.test(password)) {
      setError('A senha não atende aos requisitos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onRegister?.(name, email, cpf, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={s.successContainer}>
        <View style={s.successIconWrap}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
        <Text style={s.successTitle}>Cadastro realizado!</Text>
        <Text style={s.successSubtitle}>Bem-vindo(a)! Redirecionando para o login...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={s.backText}>Voltar</Text>
        </Pressable>

        <View style={s.card}>
          <View style={s.logoCircle}>
            <Ionicons name="heart" size={28} color={colors.primary} />
          </View>
          <Text style={s.brand}>Criar conta</Text>
          <Text style={s.subtitle}>Além do Positivo</Text>

          <View style={s.fields}>
            {[
              { label: 'Nome completo', value: name, onChange: setName, placeholder: 'Seu nome', icon: 'person-outline', autoCapitalize: 'words' },
              { label: 'Email', value: email, onChange: setEmail, placeholder: 'seu@email.com', icon: 'mail-outline', keyboardType: 'email-address', autoCapitalize: 'none' },
              { label: 'CPF', value: cpf, onChange: (v) => setCpf(maskCPF(v)), placeholder: '000.000.000-00', icon: 'card-outline', keyboardType: 'numeric' },
            ].map((field) => (
              <View key={field.label} style={s.fieldGroup}>
                <Text style={s.label}>{field.label}</Text>
                <View style={s.inputWrap}>
                  <Ionicons name={field.icon} size={16} color={theme.textMuted} />
                  <TextInput
                    style={s.input}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize || 'none'}
                    autoCorrect={false}
                  />
                </View>
              </View>
            ))}

            <View style={s.fieldGroup}>
              <Text style={s.label}>Senha</Text>
              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textPlaceholder}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(p => !p)} hitSlop={8}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color={theme.textMuted} />
                </Pressable>
              </View>
              {password.length > 0 && (
                <View style={s.checksWrap}>
                  {checks.map((c) => {
                    const ok = c.test(password);
                    return (
                      <View key={c.label} style={s.checkRow}>
                        <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={14} color={ok ? colors.successAlt : colors.error} />
                        <Text style={[s.checkLabel, { color: ok ? colors.successAlt : colors.error }]}>{c.label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [s.registerBtn, loading && s.btnDisabled, pressed && { opacity: 0.85 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={s.registerBtnText}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
          </Pressable>

          <Pressable onPress={onLoginRedirect}>
            <Text style={s.loginLink}>Já tem conta? <Text style={s.loginLinkBold}>Faça login</Text></Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xl },
  backText: { color: colors.primary, fontSize: typography.button, fontWeight: typography.bold },
  card: {
    backgroundColor: theme.card, borderRadius: radius.xxl,
    padding: spacing.xxxl, alignItems: 'center', ...shadows.strong,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: colors.primaryMedium,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  brand: { fontSize: typography.authTitle, fontWeight: typography.extrabold, color: colors.primary, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: typography.label, color: theme.textMuted, marginBottom: spacing.xxl },
  fields: { width: '100%', gap: spacing.lg, marginBottom: spacing.xl },
  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.label, fontWeight: typography.semibold, color: theme.text },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input, borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },
  checksWrap: { marginTop: spacing.sm, gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  checkLabel: { fontSize: typography.support },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    width: '100%', marginBottom: spacing.md,
  },
  errorText: { color: colors.errorText, fontSize: typography.label, flex: 1 },
  registerBtn: {
    backgroundColor: colors.primary, width: '100%', paddingVertical: 15,
    borderRadius: radius.md, alignItems: 'center', marginBottom: spacing.xl, ...shadows.cta,
  },
  btnDisabled: { opacity: 0.7 },
  registerBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.button },
  loginLink: { fontSize: typography.label, color: theme.textMuted },
  loginLinkBold: { color: colors.primary, fontWeight: typography.bold },
  successContainer: {
    flex: 1, backgroundColor: theme.bg,
    alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxxl,
  },
  successIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: typography.successTitle, fontWeight: typography.extrabold, color: colors.primary, letterSpacing: -0.5 },
  successSubtitle: { fontSize: typography.body, color: theme.textMuted, textAlign: 'center' },
});
