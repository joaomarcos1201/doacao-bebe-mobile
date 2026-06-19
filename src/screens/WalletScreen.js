import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return value || '-';
  }
};

export default function WalletScreen({ onBack }) {
  const { theme, toggleTheme } = useTheme();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const s = styles(theme);

  const fetchWallet = async () => {
    setError(null);
    try {
      const walletResp = await api.get('/api/wallet');
      console.log('[Wallet]', walletResp.data);
      const historyResp = await api.get('/api/wallet/history');
      console.log('[WalletHistory]', historyResp.data);
      setWallet(walletResp.data);
      setHistory(historyResp.data || []);
    } catch (err) {
      const apiErr = err?.apiError;
      if (apiErr?.status === 401) setError('Sessão expirada. Faça login novamente.');
      else if (apiErr?.status === 403) setError('Acesso negado. Verifique suas permissões.');
      else if (apiErr?.status === 500) setError('Erro no servidor. Tente novamente mais tarde.');
      else if (!apiErr?.status) setError('Não foi possível conectar ao servidor. Verifique sua internet.');
      else setError(apiErr?.message || 'Falha ao carregar sua carteira.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  return (
    <View style={s.container}>
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Minha Carteira</Text>
        <TouchableOpacity onPress={toggleTheme} style={s.themeBtn} activeOpacity={0.7}>
          <Text style={s.themeBtnText}>{theme.isDark ? 'Modo Claro' : 'Modo Escuro'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.content}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.pink} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <Text style={s.statusText}>Carregando carteira...</Text>
        ) : error ? (
          <View style={s.statusBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : !wallet ? (
          <View style={s.statusBox}>
            <Text style={s.statusTitle}>Nenhum dado de carteira disponível</Text>
          </View>
        ) : (
          <>
            <View style={s.walletCard}>
              <Text style={s.walletTitle}>Saldo disponível</Text>
              <Text style={s.walletValue}>R$ {wallet.saldoLiberado?.toFixed(2) ?? '0.00'}</Text>
              <Text style={s.walletLabel}>Saldo liberado para saque ou uso</Text>
            </View>
            <View style={s.walletCardSecondary}>
              <Text style={s.walletTitle}>Saldo retido</Text>
              <Text style={s.walletValue}>R$ {wallet.saldoRetido?.toFixed(2) ?? '0.00'}</Text>
              <Text style={s.walletLabel}>Valores em bloqueio aguardando liberação</Text>
            </View>

            <Text style={s.sectionTitle}>Histórico</Text>
            {history.length === 0 ? (
              <View style={s.statusBox}>
                <Text style={s.statusTitle}>Nenhuma movimentação encontrada</Text>
                <Text style={s.statusSubtitle}>Suas transações aparecerão aqui quando forem registradas.</Text>
              </View>
            ) : (
              history.map((item, index) => (
                <View key={`${item.tipo}-${index}`} style={s.historyCard}>
                  <View style={s.historyRow}>
                    <Text style={s.historyType}>{item.tipo || '—'}</Text>
                    <Text style={s.historyValue}>R$ {item.valor?.toFixed(2) ?? '0.00'}</Text>
                  </View>
                  <Text style={s.historyStatus}>{item.status || '—'}</Text>
                  <Text style={s.historyDate}>{formatDate(item.createdAt)}</Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
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
  themeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.pinkLight, borderWidth: 1, borderColor: theme.border },
  themeBtnText: { color: theme.pink, fontSize: 12, fontWeight: '600' },
  content: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 24 },
  statusBox: { marginTop: 80, alignItems: 'center', paddingHorizontal: 20 },
  statusText: { marginTop: 40, textAlign: 'center', color: theme.textMuted },
  statusTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  statusSubtitle: { fontSize: 13, color: theme.textMuted, textAlign: 'center', marginTop: 8 },
  errorText: { color: '#e05555', textAlign: 'center', fontSize: 13 },
  walletCard: {
    backgroundColor: theme.card, borderRadius: 20, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    gap: 8,
  },
  walletCardSecondary: {
    backgroundColor: theme.isDark ? '#112a44' : '#fff7f9', borderRadius: 20, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    gap: 8,
  },
  walletTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
  walletValue: { fontSize: 28, fontWeight: '800', color: theme.pink },
  walletLabel: { fontSize: 12, color: theme.textMuted },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.text, marginTop: 8 },
  historyCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    gap: 8,
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyType: { fontSize: 14, fontWeight: '700', color: theme.text },
  historyValue: { fontSize: 14, fontWeight: '700', color: theme.pink },
  historyStatus: { fontSize: 12, color: theme.textMuted },
  historyDate: { fontSize: 11, color: theme.textMuted },
});
