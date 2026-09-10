import React from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const TIPS = [
  'Use uma senha forte com pelo menos 8 caracteres',
  'Mantenha suas informações sempre atualizadas',
  'Nunca compartilhe sua senha com outras pessoas',
];

export default function ProfileScreen({ onBack, user, hasAnnouncements, sellerLoading, onSellerFeature }) {
  const { theme } = useTheme();
  const name = user?.name || user?.nome || '';
  const email = user?.email || '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const s = styles(theme);

  // Seller area items — Minhas Vendas always visible for authenticated users
  const sellerItems = [
    { label: 'Minhas Vendas', icon: 'storefront-outline', alwaysShow: true },
    { label: 'Carteira', icon: 'wallet-outline', alwaysShow: false },
  ];

  const visibleSellerItems = sellerItems.filter(
    (item) => item.alwaysShow || (!sellerLoading && hasAnnouncements === true)
  );

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenHeader title="Meu Perfil" onBack={onBack} backLabel="Voltar" />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarInitial}>{initial}</Text>
          </View>
          <Text style={s.avatarName}>{name || 'Usuário'}</Text>
          <Text style={s.avatarEmail}>{email || '—'}</Text>
          <View style={s.memberBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.primary} />
            <Text style={s.memberBadgeText}>Membro da plataforma</Text>
          </View>
        </View>

        {/* Dados pessoais */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Dados Pessoais</Text>
          <View style={s.fieldGroup}>
            <Text style={s.label}>Nome</Text>
            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={15} color={theme.textMuted} />
              <TextInput style={s.input} value={name} editable={false} />
            </View>
          </View>
          <View style={s.fieldGroup}>
            <Text style={s.label}>Email</Text>
            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={15} color={theme.textMuted} />
              <TextInput style={s.input} value={email} editable={false} />
            </View>
          </View>
          <Text style={s.readOnlyHint}>Dados carregados da sua conta.</Text>
        </View>

        {/* Área do vendedor */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Área do Vendedor</Text>
          {sellerLoading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={s.loadingText}>Verificando seus anúncios...</Text>
            </View>
          ) : (
            visibleSellerItems.map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [s.sellerLink, pressed && s.sellerLinkPressed]}
                onPress={() => onSellerFeature?.(item.label)}
              >
                <View style={s.sellerLinkIcon}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <Text style={s.sellerLinkText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </Pressable>
            ))
          )}
        </View>

        {/* Dicas de segurança */}
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

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  avatarSection: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.cta,
  },
  avatarInitial: { color: '#fff', fontSize: 36, fontWeight: typography.bold },
  avatarName: { fontSize: typography.cardTitle, fontWeight: typography.extrabold, color: theme.textTitle, letterSpacing: -0.3 },
  avatarEmail: { fontSize: typography.label, color: theme.textMuted },
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.pinkLight, paddingHorizontal: spacing.sm,
    paddingVertical: 4, borderRadius: radius.pill,
  },
  memberBadgeText: { color: colors.primary, fontSize: 11, fontWeight: typography.semibold },

  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.md,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: theme.textTitle, letterSpacing: -0.2 },
  readOnlyHint: { color: theme.textMuted, fontSize: typography.support },

  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.label, fontWeight: typography.semibold, color: theme.text },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input, borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 11,
    opacity: 0.8,
  },
  input: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },

  sellerLink: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  sellerLinkPressed: { opacity: 0.7 },
  sellerLinkIcon: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center',
  },
  sellerLinkText: { flex: 1, fontSize: typography.button, fontWeight: typography.semibold, color: theme.text },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  loadingText: { color: theme.textMuted, fontSize: typography.label },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  tipNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tipNumText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.support },
  tipText: { flex: 1, fontSize: typography.label, color: theme.textMuted, lineHeight: 20, paddingTop: 4 },
});
