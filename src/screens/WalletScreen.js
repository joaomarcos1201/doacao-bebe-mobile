import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Modal, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, Pressable, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, walletApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const PIX_TYPES = ['CPF', 'Email', 'Telefone', 'Chave aleatória'];
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const date = (value) => {
  if (!value) return 'Data não informada';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Data não informada' : parsed.toLocaleDateString('pt-BR');
};
const typeLabel = (value) => ({ VENDA: 'Venda', COMISSAO: 'Comissão', SAQUE: 'Saque', ESTORNO: 'Estorno' }[String(value || '').toUpperCase()] || value || 'Movimentação');
const statusLabel = (value) => ({ RETIDO: 'Retido', LIBERADO: 'Liberado', SACADO: 'Sacado' }[String(value || '').toUpperCase()] || value || 'Status não informado');
const simulatedPix = (type) => ({ CPF: '123.456.789-09', Email: 'usuario.demo@example.com', Telefone: '(11) 99999-9999', 'Chave aleatória': 'a1b2c3d4-e5f6-4789-abcd-1234567890ab' }[type]);

export default function WalletScreen({ onBack }) {
  const { theme } = useTheme();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ type: 'CPF', key: '', holderName: '', holderCpf: '', value: '' });
  const s = styles(theme);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setWalletError(''); setHistoryError('');
    const [walletResult, historyResult] = await Promise.allSettled([walletApi.get(), walletApi.history()]);
    if (walletResult.status === 'fulfilled') setWallet(walletResult.value.data || null);
    else setWalletError(getApiErrorMessage(walletResult.reason, 'Não foi possível carregar sua carteira.'));
    if (historyResult.status === 'fulfilled') setHistory(Array.isArray(historyResult.value.data) ? historyResult.value.data : []);
    else setHistoryError(getApiErrorMessage(historyResult.reason, 'Não foi possível carregar as movimentações.'));
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateForm = (field, value) => setForm((curr) => ({ ...curr, [field]: value }));

  const openWithdrawal = () => {
    if (Number(wallet?.saldoLiberado || 0) <= 0) { setFormError('Não há saldo liberado disponível para saque.'); return; }
    setFormError(''); setSuccess(''); setModalOpen(true);
  };

  const simulatePix = () => setForm((curr) => ({ ...curr, key: simulatedPix(curr.type), holderName: 'Usuário Demonstração', holderCpf: '123.456.789-09' }));

  const validateForm = () => {
    const value = Number(String(form.value).replace(',', '.'));
    const key = form.key.trim();
    const holderCpf = form.holderCpf.replace(/\D/g, '');
    if (!form.value || !Number.isFinite(value) || value <= 0) return 'Informe um valor de saque maior que zero.';
    if (value > Number(wallet?.saldoLiberado || 0)) return 'O valor excede o saldo liberado.';
    if (!PIX_TYPES.includes(form.type)) return 'Selecione um tipo de chave PIX.';
    if (!key) return 'Informe a chave PIX.';
    if (form.type === 'CPF' && key.replace(/\D/g, '').length !== 11) return 'A chave PIX CPF deve possuir 11 números.';
    if (form.type === 'Email' && !/^\S+@\S+\.\S+$/.test(key)) return 'Informe um email válido como chave PIX.';
    if (form.type === 'Telefone' && key.replace(/\D/g, '').length < 10) return 'Informe um telefone válido como chave PIX.';
    if (form.type === 'Chave aleatória' && key.length < 10) return 'Informe uma chave aleatória válida.';
    if (!form.holderName.trim()) return 'Informe o nome do titular.';
    if (holderCpf.length !== 11) return 'Informe um CPF do titular com 11 números.';
    return '';
  };

  const submitWithdrawal = async () => {
    if (submitting) return;
    const validationError = validateForm();
    if (validationError) { setFormError(validationError); return; }
    setSubmitting(true); setFormError('');
    try {
      const value = Number(String(form.value).replace(',', '.'));
      await walletApi.requestWithdrawal(value);
      setModalOpen(false);
      setForm({ type: 'CPF', key: '', holderName: '', holderCpf: '', value: '' });
      setSuccess('Saldo retirado com sucesso');
      await load(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Não foi possível solicitar o saque.'));
    } finally { setSubmitting(false); }
  };

  return (
    <View style={s.container}>
      <ScreenHeader title="Carteira" onBack={onBack} backLabel="Voltar" />

      {loading ? (
        <View style={s.stateWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.stateText}>Carregando sua carteira...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Saldos */}
          {walletError ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={s.errorText}>{walletError}</Text>
            </View>
          ) : (
            <View style={s.balanceGrid}>
              <View style={[s.balanceCard, s.balanceCardRetido]}>
                <View style={s.balanceIconWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.warning} />
                </View>
                <Text style={s.balanceValue}>{money(wallet?.saldoRetido)}</Text>
                <Text style={s.balanceLabel}>Saldo retido</Text>
                <Text style={s.balanceHint}>Ainda não disponível para saque</Text>
              </View>
              <View style={[s.balanceCard, s.balanceCardLiberado]}>
                <View style={[s.balanceIconWrap, { backgroundColor: 'rgba(22,163,74,0.12)' }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.successAlt} />
                </View>
                <Text style={[s.balanceValue, { color: colors.successAlt }]}>{money(wallet?.saldoLiberado)}</Text>
                <Text style={s.balanceLabel}>Saldo liberado</Text>
                <Text style={s.balanceHint}>Disponível para saque</Text>
                <Pressable
                  style={({ pressed }) => [s.withdrawBtn, Number(wallet?.saldoLiberado || 0) <= 0 && s.btnDisabled, pressed && { opacity: 0.85 }]}
                  onPress={openWithdrawal}
                  disabled={Number(wallet?.saldoLiberado || 0) <= 0}
                >
                  <Text style={s.withdrawBtnText}>Sacar</Text>
                </Pressable>
              </View>
            </View>
          )}

          {!!success && (
            <View style={s.successBox}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.successAlt} />
              <Text style={s.successText}>{success}</Text>
            </View>
          )}
          {!!formError && !modalOpen && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={s.errorText}>{formError}</Text>
            </View>
          )}

          {/* Histórico */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Histórico de movimentações</Text>
            {historyError ? (
              <Text style={s.errorText}>{historyError}</Text>
            ) : history.length === 0 ? (
              <Text style={s.muted}>Você ainda não possui movimentações financeiras.</Text>
            ) : (
              history.map((mov) => {
                const amount = Number(mov.valor || 0);
                return (
                  <View style={s.movRow} key={mov.id}>
                    <View style={s.movInfo}>
                      <Text style={s.movType}>{typeLabel(mov.tipo)}</Text>
                      <Text style={s.muted}>{date(mov.createdAt)}{mov.pedido?.id ? ` · Pedido #${mov.pedido.id}` : ''}</Text>
                    </View>
                    <View style={s.movValue}>
                      <Text style={[s.movAmount, amount < 0 && s.movAmountNeg]}>
                        {amount >= 0 ? '+' : ''}{money(amount)}
                      </Text>
                      <StatusBadge status={mov.status} label={statusLabel(mov.status)} />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}

      {/* Modal saque */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => !submitting && setModalOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Saque via PIX</Text>
              <Pressable onPress={() => !submitting && setModalOpen(false)} style={s.modalClose}>
                <Ionicons name="close" size={20} color={theme.textMuted} />
              </Pressable>
            </View>

            <Text style={s.fieldLabel}>Tipo da chave PIX</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeList}>
              {PIX_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={({ pressed }) => [s.typeBtn, form.type === type && s.typeBtnActive, pressed && { opacity: 0.8 }]}
                  onPress={() => updateForm('type', type)}
                >
                  <Text style={[s.typeBtnText, form.type === type && s.typeBtnTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {[
              { placeholder: 'Chave PIX', field: 'key', autoCapitalize: 'none' },
              { placeholder: 'Nome do titular', field: 'holderName' },
              { placeholder: 'CPF do titular', field: 'holderCpf', keyboardType: 'number-pad' },
              { placeholder: 'Valor do saque', field: 'value', keyboardType: 'decimal-pad' },
            ].map((f) => (
              <TextInput
                key={f.field}
                style={s.modalInput}
                value={form[f.field]}
                onChangeText={(v) => updateForm(f.field, v)}
                placeholder={f.placeholder}
                placeholderTextColor={colors.textPlaceholder}
                keyboardType={f.keyboardType}
                autoCapitalize={f.autoCapitalize || 'words'}
              />
            ))}

            <Pressable style={({ pressed }) => [s.simulateBtn, pressed && { opacity: 0.8 }]} onPress={simulatePix}>
              <Ionicons name="flask-outline" size={15} color={colors.warning} />
              <Text style={s.simulateBtnText}>Simular dados PIX</Text>
            </Pressable>

            {!!formError && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                <Text style={s.errorText}>{formError}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [s.confirmBtn, submitting && s.btnDisabled, pressed && { opacity: 0.85 }]}
              onPress={submitWithdrawal}
              disabled={submitting}
            >
              <Text style={s.confirmBtnText}>{submitting ? 'Processando...' : 'Confirmar Saque'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  stateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body },

  balanceGrid: { flexDirection: 'row', gap: spacing.md },
  balanceCard: {
    flex: 1, backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.lg, alignItems: 'center', gap: spacing.xs,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  balanceCardRetido: {},
  balanceCardLiberado: {},
  balanceIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(217,119,6,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  balanceValue: { color: theme.text, fontSize: 20, fontWeight: typography.black },
  balanceLabel: { color: theme.text, fontSize: typography.label, fontWeight: typography.extrabold, textAlign: 'center' },
  balanceHint: { color: theme.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 15 },
  withdrawBtn: {
    backgroundColor: colors.successAlt, borderRadius: radius.sm,
    paddingHorizontal: spacing.xl, paddingVertical: 9, marginTop: spacing.sm,
  },
  withdrawBtnText: { color: '#fff', fontSize: typography.label, fontWeight: typography.extrabold },

  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.md,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: theme.textTitle },

  movRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md,
    borderTopWidth: 1, borderTopColor: theme.border, paddingTop: spacing.md,
  },
  movInfo: { flex: 1, gap: 4 },
  movType: { color: theme.text, fontSize: typography.label, fontWeight: typography.extrabold },
  muted: { color: theme.textMuted, fontSize: typography.support },
  movValue: { alignItems: 'flex-end', gap: 4 },
  movAmount: { color: colors.successAlt, fontSize: typography.label, fontWeight: typography.black },
  movAmountNeg: { color: colors.error },

  successBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  successText: { color: colors.successText, fontSize: typography.label, fontWeight: typography.semibold },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  errorText: { color: colors.errorText, fontSize: typography.label, flex: 1 },
  btnDisabled: { opacity: 0.5 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  modal: {
    backgroundColor: theme.card, borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl, padding: spacing.xl, gap: spacing.md,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: theme.textTitle, fontSize: typography.cardTitle, fontWeight: typography.extrabold },
  modalClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.pinkSurface, alignItems: 'center', justifyContent: 'center',
  },
  fieldLabel: { color: theme.text, fontSize: typography.label, fontWeight: typography.semibold },
  typeList: { gap: spacing.sm },
  typeBtn: {
    borderWidth: 1.5, borderColor: theme.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: 9,
  },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeBtnText: { color: theme.textMuted, fontSize: typography.label, fontWeight: typography.semibold },
  typeBtnTextActive: { color: '#fff' },
  modalInput: {
    backgroundColor: theme.input, color: theme.text,
    borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: typography.body,
  },
  simulateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.warning,
    borderRadius: radius.md, padding: spacing.md, justifyContent: 'center',
  },
  simulateBtnText: { color: colors.warning, fontWeight: typography.extrabold, fontSize: typography.label },
  confirmBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: 15, alignItems: 'center', ...shadows.cta,
  },
  confirmBtnText: { color: '#fff', fontWeight: typography.black, fontSize: typography.button },
});
