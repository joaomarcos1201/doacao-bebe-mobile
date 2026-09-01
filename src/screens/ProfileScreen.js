import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TIPS = [
  'Use uma senha forte com pelo menos 8 caracteres',
  'Mantenha suas informações sempre atualizadas',
  'Nunca compartilhe sua senha com outras pessoas',
];

export default function ProfileScreen({ onBack, user, hasAnnouncements, sellerLoading, onSellerFeature }) {
  const { theme, toggleTheme } = useTheme();
  const name = user?.name || user?.nome || '';
  const email = user?.email || '';
  const s = styles(theme);

  const initial = name.trim().charAt(0).toUpperCase() || '?';

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
                editable={false}
              />
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                value={email}
                editable={false}
              />
            </View>
          </View>

          <Text style={s.readOnlyHint}>Dados carregados da sua conta.</Text>
        </View>

        {sellerLoading ? <View style={s.card}><Text style={s.cardTitle}>Verificando seus anúncios...</Text></View> : hasAnnouncements === true && <View style={s.card}><Text style={s.cardTitle}>Área do vendedor</Text><TouchableOpacity style={s.sellerLink} onPress={() => onSellerFeature?.('Minhas Vendas')}><Text style={s.sellerLinkText}>Minhas Vendas</Text></TouchableOpacity><TouchableOpacity style={s.sellerLink} onPress={() => onSellerFeature?.('Carteira')}><Text style={s.sellerLinkText}>Carteira</Text></TouchableOpacity></View>}

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
  readOnlyHint: { color: theme.textMuted, fontSize: 12 },
  sellerLink: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  sellerLinkText: { color: theme.pink, fontSize: 14, fontWeight: '700' },

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

  // Anúncios
  emptyAds: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyAdsIcon: { fontSize: 36 },
  emptyAdsText: { fontSize: 13, color: theme.textMuted },
  adCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  adImageBox: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  adImageEmoji: { fontSize: 24 },
  adInfo: { flex: 1, gap: 3 },
  adName: { fontSize: 14, fontWeight: '700', color: theme.text },
  adMeta: { fontSize: 12, color: theme.textMuted },
  adStatusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  adStatusActive: { backgroundColor: 'rgba(58,170,110,0.12)' },
  adStatusClosed: { backgroundColor: 'rgba(150,150,150,0.12)' },
  adStatusText: { fontSize: 11, fontWeight: '600' },

  // Dicas
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: theme.pink, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tipNumText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  tipText: { flex: 1, fontSize: 13, color: theme.textMuted, lineHeight: 20, paddingTop: 3 },
});
