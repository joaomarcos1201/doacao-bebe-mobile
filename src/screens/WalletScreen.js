import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, walletApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';

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
  const { theme, toggleTheme } = useTheme();
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
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const openWithdrawal = () => {
    if (Number(wallet?.saldoLiberado || 0) <= 0) { setFormError('Não há saldo liberado disponível para saque.'); return; }
    setFormError(''); setSuccess(''); setModalOpen(true);
  };
  const simulatePix = () => setForm((current) => ({ ...current, key: simulatedPix(current.type), holderName: 'Usuário Demonstração', holderCpf: '123.456.789-09' }));
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
      setModalOpen(false); setForm({ type: 'CPF', key: '', holderName: '', holderCpf: '', value: '' });
      setSuccess('Saldo retirado com sucesso');
      await load(true);
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Não foi possível solicitar o saque.'));
    } finally { setSubmitting(false); }
  };

  return <View style={s.container}>
    <ScreenHeader title="Carteira" onBack={onBack} />
    {loading ? <View style={s.state}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.muted}>Carregando sua carteira...</Text></View> : <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.pink} />}>
      {walletError ? <View style={s.errorBox}><Text style={s.error}>{walletError}</Text></View> : <View style={s.balanceGrid}><View style={s.balanceCard}><Text style={s.balanceIcon}>🔒</Text><Text style={s.balanceValue}>{money(wallet?.saldoRetido)}</Text><Text style={s.balanceLabel}>Saldo retido</Text><Text style={s.balanceHint}>Ainda não disponível para saque</Text></View><View style={s.balanceCard}><Text style={s.balanceIcon}>✅</Text><Text style={s.balanceValue}>{money(wallet?.saldoLiberado)}</Text><Text style={s.balanceLabel}>Saldo liberado</Text><Text style={s.balanceHint}>Disponível para saque</Text><TouchableOpacity style={[s.withdrawButton, Number(wallet?.saldoLiberado || 0) <= 0 && s.disabled]} onPress={openWithdrawal} disabled={Number(wallet?.saldoLiberado || 0) <= 0}><Text style={s.withdrawButtonText}>Sacar</Text></TouchableOpacity></View></View>}
      {success && <Text style={s.success}>{success}</Text>}{formError && !modalOpen && <Text style={s.error}>{formError}</Text>}
      <View style={s.card}><Text style={s.cardTitle}>Histórico de movimentações</Text>{historyError ? <Text style={s.error}>{historyError}</Text> : history.length === 0 ? <Text style={s.muted}>Você ainda não possui movimentações financeiras.</Text> : history.map((movement) => { const amount = Number(movement.valor || 0); return <View style={s.movement} key={movement.id}><View style={s.movementInfo}><Text style={s.movementType}>{typeLabel(movement.tipo)}</Text><Text style={s.muted}>{date(movement.createdAt)}{movement.pedido?.id ? ` • Pedido #${movement.pedido.id}` : ''}</Text></View><View style={s.movementValue}><Text style={[s.amount, amount < 0 && s.negative]}>{amount >= 0 ? '+' : ''}{money(amount)}</Text><StatusBadge status={movement.status} label={statusLabel(movement.status)} /></View></View>; })}</View>
    </ScrollView>}
    <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => !submitting && setModalOpen(false)}><View style={s.modalOverlay}><View style={s.modal}><View style={s.modalHeader}><Text style={s.modalTitle}>Saque via PIX simulado</Text><TouchableOpacity onPress={() => !submitting && setModalOpen(false)}><Text style={s.close}>Fechar</Text></TouchableOpacity></View><Text style={s.label}>Tipo da chave PIX</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeList}>{PIX_TYPES.map((type) => <TouchableOpacity key={type} style={[s.typeButton, form.type === type && s.typeButtonActive]} onPress={() => updateForm('type', type)}><Text style={[s.typeText, form.type === type && s.typeTextActive]}>{type}</Text></TouchableOpacity>)}</ScrollView><TextInput style={s.input} value={form.key} onChangeText={(value) => updateForm('key', value)} placeholder="Chave PIX" placeholderTextColor={theme.textMuted} autoCapitalize="none" /><TextInput style={s.input} value={form.holderName} onChangeText={(value) => updateForm('holderName', value)} placeholder="Nome do titular" placeholderTextColor={theme.textMuted} /><TextInput style={s.input} value={form.holderCpf} onChangeText={(value) => updateForm('holderCpf', value)} placeholder="CPF do titular" placeholderTextColor={theme.textMuted} keyboardType="number-pad" /><TextInput style={s.input} value={form.value} onChangeText={(value) => updateForm('value', value)} placeholder="Valor do saque" placeholderTextColor={theme.textMuted} keyboardType="decimal-pad" /><TouchableOpacity style={s.simulateButton} onPress={simulatePix}><Text style={s.simulateText}>🧪 Simular dados PIX</Text></TouchableOpacity>{formError && <Text style={s.error}>{formError}</Text>}<TouchableOpacity style={[s.confirmButton, submitting && s.disabled]} onPress={submitWithdrawal} disabled={submitting}><Text style={s.confirmText}>{submitting ? 'Processando...' : 'Confirmar Saque'}</Text></TouchableOpacity></View></View></Modal>
  </View>;
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }, navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border }, back: { color: theme.pink, fontWeight: '700' }, title: { color: theme.text, fontSize: 17, fontWeight: '800' }, theme: { fontSize: 20 }, scroll: { padding: 16, gap: 16, flexGrow: 1 }, balanceGrid: { flexDirection: 'row', gap: 12 }, balanceCard: { flex: 1, backgroundColor: theme.card, borderRadius: 18, padding: 16, alignItems: 'center', gap: 6 }, balanceIcon: { fontSize: 26 }, balanceValue: { color: theme.text, fontSize: 19, fontWeight: '900' }, balanceLabel: { color: theme.text, fontSize: 13, fontWeight: '800', textAlign: 'center' }, balanceHint: { color: theme.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 15 }, withdrawButton: { backgroundColor: '#3aaa6e', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 9, marginTop: 7 }, withdrawButtonText: { color: '#fff', fontSize: 13, fontWeight: '800' }, card: { backgroundColor: theme.card, borderRadius: 18, padding: 18, gap: 14 }, cardTitle: { color: theme.text, fontSize: 16, fontWeight: '800' }, movement: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 }, movementInfo: { flex: 1, gap: 5 }, movementType: { color: theme.text, fontSize: 14, fontWeight: '800' }, movementValue: { alignItems: 'flex-end', gap: 4 }, amount: { color: '#3aaa6e', fontSize: 14, fontWeight: '900' }, negative: { color: '#c43d54' }, muted: { color: theme.textMuted, fontSize: 12 }, success: { color: '#3aaa6e', textAlign: 'center', fontWeight: '800' }, errorBox: { backgroundColor: theme.card, borderRadius: 16, padding: 16 }, error: { color: '#c43d54', textAlign: 'center', fontWeight: '600' }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }, modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }, modal: { backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalTitle: { color: theme.text, fontSize: 19, fontWeight: '900' }, close: { color: theme.pink, fontWeight: '700' }, label: { color: theme.text, fontSize: 13, fontWeight: '800' }, typeList: { gap: 8 }, typeButton: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }, typeButtonActive: { backgroundColor: theme.pink, borderColor: theme.pink }, typeText: { color: theme.textMuted, fontSize: 12, fontWeight: '700' }, typeTextActive: { color: '#fff' }, input: { backgroundColor: theme.bg, color: theme.text, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 13, fontSize: 15 }, simulateButton: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#c57a16', borderRadius: 12, padding: 13, alignItems: 'center' }, simulateText: { color: '#c57a16', fontWeight: '800' }, confirmButton: { backgroundColor: theme.pink, borderRadius: 14, padding: 15, alignItems: 'center' }, confirmText: { color: '#fff', fontWeight: '900', fontSize: 15 }, disabled: { opacity: 0.5 },
});
