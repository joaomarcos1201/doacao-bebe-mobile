import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api, { setSessionToken } from '../services/api';
import { salvarToken, salvarUsuario } from '../services/auth';

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

export default function RegisterScreen({ onBack, onLoginRedirect }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(null);
  const s = styles(theme);

  const handleRegister = () => {
    setLoading(true);
    (async () => {
      try {
        const payload = { nome: name, email, cpf, senha: password };
        const resp = await api.post('/api/auth/cadastro', payload);
        const data = resp.data;
        // salvar token e usuário para sessão persistente
        await salvarToken(data.token);
        setSessionToken(data.token);
        const user = { id: data.id, name: data.nome ?? data.name, email: data.email, isAdmin: !!data.isAdmin };
        await salvarUsuario(user);
        setLoading(false);
        setSuccess(true);
        setTimeout(() => onLoginRedirect?.(), 3000);
      } catch (err) {
        setLoading(false);
        console.log('[Register] error', err);
        const apiErr = err?.apiError;
        const status = apiErr?.status;
        if (status === 400) setMessage(apiErr?.message || 'Dados inválidos.');
        else if (!status) setMessage('Falha de conexão. Tente novamente.');
        else setMessage(apiErr?.message || 'Erro no servidor.');
      }
    })();
  };

  if (success) {
    return (
      <View style={s.successContainer}>
        <Text style={s.successIcon}>✅</Text>
        <Text style={s.successTitle}>Cadastro realizado!</Text>
        <Text style={s.successSubtitle}>Redirecionando para o login...</Text>
      </View>
    );
  }

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
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🌸</Text>
          </View>
          <Text style={s.title}>Criar conta</Text>
          <Text style={s.subtitle}>Além do Positivo</Text>
          {message && <Text style={s.errorText}>{message}</Text>}

          <View style={s.fields}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>Nome completo</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="words"
              />
            </View>

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
              <Text style={s.label}>CPF</Text>
              <TextInput
                style={s.input}
                value={cpf}
                onChangeText={(v) => setCpf(maskCPF(v))}
                placeholder="000.000.000-00"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
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
              {password.length > 0 && (
                <View style={s.passwordChecks}>
                  {checks.map((c) => {
                    const ok = c.test(password);
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
          </View>

          <TouchableOpacity
            style={[s.registerBtn, loading && s.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.registerBtnText}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLoginRedirect} activeOpacity={0.7}>
            <Text style={s.loginLink}>
              Já tem conta? <Text style={s.loginLinkBold}>Faça login</Text>
            </Text>
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
    borderRadius: 20, padding: 32,
    maxWidth: 400, width: '100%',
    alignSelf: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 6,
  },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: '#e8a0a8',
    backgroundColor: 'rgba(232,96,122,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoEmoji: { fontSize: 30 },
  title: { fontSize: 20, fontWeight: '800', color: theme.pink, marginBottom: 4 },
  subtitle: { fontSize: 13, color: theme.textMuted, marginBottom: 28 },
  fields: { width: '100%', gap: 16, marginBottom: 24 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text },
  input: {
    backgroundColor: theme.isDark ? '#1a1a1a' : '#fdf0f2',
    borderWidth: 1, borderColor: theme.isDark ? '#333' : '#e8d0d4',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: theme.text,
  },
  errorText: { color: '#e05555', marginBottom: 12, textAlign: 'center' },
  passwordChecks: { marginTop: 8, gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkIcon: { fontSize: 13, fontWeight: '700' },
  checkLabel: { fontSize: 12 },
  registerBtn: {
    backgroundColor: theme.pink, width: '100%',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  registerBtnDisabled: { opacity: 0.7 },
  registerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  loginLink: { fontSize: 13, color: theme.textMuted },
  loginLinkBold: { color: theme.pink, fontWeight: '700' },

  // Sucesso
  successContainer: {
    flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  successIcon: { fontSize: 64 },
  successTitle: { fontSize: 22, fontWeight: '800', color: theme.pink },
  successSubtitle: { fontSize: 14, color: theme.textMuted },
});
