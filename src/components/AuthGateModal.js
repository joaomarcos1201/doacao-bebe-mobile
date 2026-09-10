import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const maskCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const PASSWORD_CHECKS = [
  { label: 'Letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Caractere especial', test: (p) => /[^a-zA-Z0-9]/.test(p) },
  { label: 'Número', test: (p) => /[0-9]/.test(p) },
];

const ACTION_LABELS = {
  favorite: 'Para favoritar produtos, entre na sua conta.',
  buy: 'Para comprar, entre na sua conta.',
  announce: 'Para anunciar produtos, entre na sua conta.',
  profile: 'Para acessar seu perfil, entre na sua conta.',
  orders: 'Para ver seus pedidos, entre na sua conta.',
  default: 'Entre na sua conta para continuar.',
};

export default function AuthGateModal({ visible, onClose, onSuccess, actionType = 'default' }) {
  const { theme } = useTheme();
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const s = styles(theme);

  const resetFields = () => {
    setEmail(''); setPassword(''); setShowPass(false);
    setName(''); setRegEmail(''); setCpf(''); setRegPass(''); setShowRegPass(false);
    setError('');
  };

  const handleClose = () => {
    resetFields();
    onClose?.();
  };

  const switchTab = (t) => { setTab(t); setError(''); };

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Informe seu email e senha.'); return; }
    setLoading(true); setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      resetFields();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Não foi possível entrar.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!name.trim() || !regEmail.trim() || cpf.replace(/\D/g, '').length !== 11 || !regPass) {
      setError('Preencha todos os campos corretamente.');
      return;
    }
    if (!PASSWORD_CHECKS.every((c) => c.test(regPass))) {
      setError('A senha não atende aos requisitos.');
      return;
    }
    setLoading(true); setError('');
    try {
      await register(name.trim(), regEmail.trim().toLowerCase(), cpf, regPass);
      resetFields();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Não foi possível criar sua conta.');
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={s.backdrop} onPress={handleClose} />
        <View style={s.sheet}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={s.logoCircle}>
              <Ionicons name="heart" size={20} color={colors.primary} />
            </View>
            <View style={s.headerText}>
              <Text style={s.headerTitle}>Além do Positivo</Text>
              <Text style={s.headerSubtitle}>{ACTION_LABELS[actionType] || ACTION_LABELS.default}</Text>
            </View>
            <Pressable onPress={handleClose} style={({ pressed }) => [s.closeBtn, pressed && { opacity: 0.7 }]}>
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={s.tabs}>
            <Pressable style={[s.tab, tab === 'login' && s.tabActive]} onPress={() => switchTab('login')}>
              <Text style={[s.tabText, tab === 'login' && s.tabTextActive]}>Entrar</Text>
            </Pressable>
            <Pressable style={[s.tab, tab === 'register' && s.tabActive]} onPress={() => switchTab('register')}>
              <Text style={[s.tabText, tab === 'register' && s.tabTextActive]}>Criar conta</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={s.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {tab === 'login' ? (
              <>
                <Field label="Email" icon="mail-outline" value={email} onChange={setEmail}
                  placeholder="seu@email.com" keyboardType="email-address" theme={theme} s={s} />
                <Field label="Senha" icon="lock-closed-outline" value={password} onChange={setPassword}
                  placeholder="••••••••" secure={!showPass} onToggleSecure={() => setShowPass(p => !p)}
                  showSecure={showPass} theme={theme} s={s} />

                {!!error && <ErrorBox message={error} s={s} />}

                <Pressable
                  style={({ pressed }) => [s.primaryBtn, loading && s.btnDisabled, pressed && { opacity: 0.85 }]}
                  onPress={handleLogin} disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.primaryBtnText}>Entrar</Text>
                  }
                </Pressable>
              </>
            ) : (
              <>
                <Field label="Nome completo" icon="person-outline" value={name} onChange={setName}
                  placeholder="Seu nome" autoCapitalize="words" theme={theme} s={s} />
                <Field label="Email" icon="mail-outline" value={regEmail} onChange={setRegEmail}
                  placeholder="seu@email.com" keyboardType="email-address" theme={theme} s={s} />
                <Field label="CPF" icon="card-outline" value={cpf} onChange={(v) => setCpf(maskCPF(v))}
                  placeholder="000.000.000-00" keyboardType="numeric" theme={theme} s={s} />
                <Field label="Senha" icon="lock-closed-outline" value={regPass} onChange={setRegPass}
                  placeholder="••••••••" secure={!showRegPass} onToggleSecure={() => setShowRegPass(p => !p)}
                  showSecure={showRegPass} theme={theme} s={s} />

                {regPass.length > 0 && (
                  <View style={s.checksWrap}>
                    {PASSWORD_CHECKS.map((c) => {
                      const ok = c.test(regPass);
                      return (
                        <View key={c.label} style={s.checkRow}>
                          <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={13}
                            color={ok ? colors.successAlt : colors.error} />
                          <Text style={[s.checkLabel, { color: ok ? colors.successAlt : colors.error }]}>{c.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {!!error && <ErrorBox message={error} s={s} />}

                <Pressable
                  style={({ pressed }) => [s.primaryBtn, loading && s.btnDisabled, pressed && { opacity: 0.85 }]}
                  onPress={handleRegister} disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.primaryBtnText}>Criar conta</Text>
                  }
                </Pressable>
              </>
            )}
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, icon, value, onChange, placeholder, keyboardType, autoCapitalize, secure, onToggleSecure, showSecure, theme, s }) {
  return (
    <View style={s.fieldGroup}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        <Ionicons name={icon} size={15} color={theme.textMuted} />
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          secureTextEntry={secure}
        />
        {onToggleSecure && (
          <Pressable onPress={onToggleSecure} hitSlop={8}>
            <Ionicons name={showSecure ? 'eye-off-outline' : 'eye-outline'} size={15} color={theme.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ErrorBox({ message, s }) {
  return (
    <View style={s.errorBox}>
      <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
      <Text style={s.errorText}>{message}</Text>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: theme.card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '92%',
    ...shadows.strong,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  logoCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.pinkLight, borderWidth: 1.5, borderColor: colors.primaryMedium,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: colors.primary, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: typography.support, color: theme.textMuted, marginTop: 1 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.pinkSurface, alignItems: 'center', justifyContent: 'center',
  },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl, marginTop: spacing.md,
    backgroundColor: theme.input, borderRadius: radius.sm, padding: 3,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radius.xs },
  tabActive: { backgroundColor: theme.card, ...shadows.inner },
  tabText: { fontSize: typography.label, color: theme.textMuted, fontWeight: typography.medium },
  tabTextActive: { color: colors.primary, fontWeight: typography.bold },

  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md },

  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.label, fontWeight: typography.semibold, color: theme.text },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input, borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },

  checksWrap: { gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  checkLabel: { fontSize: typography.support },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  errorText: { color: colors.errorText, fontSize: typography.label, flex: 1 },

  primaryBtn: {
    backgroundColor: colors.primary, paddingVertical: 15,
    borderRadius: radius.md, alignItems: 'center', ...shadows.cta,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.button },
});
