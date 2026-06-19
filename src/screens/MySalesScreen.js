import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
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

const getStatusColor = (status, theme) => {
  if (status?.toLowerCase().includes('pago') || status?.toLowerCase().includes('entreg')) return '#3aaa6e';
  if (status?.toLowerCase().includes('pend')) return '#e8a03a';
  return theme.textMuted;
};

export default function MySalesScreen({ onBack }) {
  const { theme, toggleTheme } = useTheme();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const s = styles(theme);

  const fetchSales = async () => {
    setError(null);
    try {
      const response = await api.get('/api/orders/vendas');
      console.log('[Sales]', response.data);
      setSales(response.data || []);
    } catch (err) {
      const apiErr = err?.apiError;
      if (apiErr?.status === 401) setError('Sessão expirada. Faça login novamente.');
      else if (apiErr?.status === 403) setError('Acesso negado. Você não tem permissão para ver suas vendas.');
      else if (apiErr?.status === 500) setError('Erro no servidor. Tente novamente mais tarde.');
      else if (!apiErr?.status) setError('Não foi possível conectar ao servidor. Verifique sua internet.');
      else setError(apiErr?.message || 'Falha ao carregar vendas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales();
  };

  return (
    <View style={s.container}>
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Minhas Vendas</Text>
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
          <Text style={s.statusText}>Carregando vendas...</Text>
        ) : error ? (
          <View style={s.statusBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : sales.length === 0 ? (
          <View style={s.statusBox}>
            <Text style={s.statusTitle}>Nenhuma venda encontrada</Text>
            <Text style={s.statusSubtitle}>Você ainda não vendeu nenhum produto.</Text>
          </View>
        ) : (
          sales.map((order) => (
            <TouchableOpacity key={order.id} style={s.card} activeOpacity={0.8} onPress={() => {}}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Pedido #{order.id}</Text>
                <Text style={[s.statusBadge, { borderColor: getStatusColor(order.statusEnvio, theme) }]}>Envio: {order.statusEnvio || '—'}</Text>
              </View>
              <Text style={s.cardLabel}>Produto</Text>
              <Text style={s.cardValue}>{order.produto?.nome || '—'}</Text>
              <Text style={s.cardLabel}>Comprador</Text>
              <Text style={s.cardValue}>{order.comprador?.nome || '—'}</Text>
              <View style={s.row}>
                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>Produto</Text>
                  <Text style={s.metaValue}>R$ {order.valorProduto?.toFixed(2) ?? '0.00'}</Text>
                </View>
                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>Pagamento</Text>
                  <Text style={[s.metaValue, { color: getStatusColor(order.statusPagamento, theme) }]}>{order.statusPagamento || '—'}</Text>
                </View>
              </View>
              <Text style={s.cardLabel}>Rastreio</Text>
              <Text style={s.cardValue}>{order.codigoRastreio || 'Não disponível'}</Text>
              <Text style={s.cardFooter}>{formatDate(order.createdAt)}</Text>
            </TouchableOpacity>
          ))
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
  card: {
    backgroundColor: theme.card, borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1 },
  cardLabel: { fontSize: 12, color: theme.textMuted, marginTop: 6 },
  cardValue: { fontSize: 14, fontWeight: '600', color: theme.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  metaBox: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 11, color: theme.textMuted },
  metaValue: { fontSize: 14, fontWeight: '700', color: theme.text },
  cardFooter: { marginTop: 10, fontSize: 11, color: theme.textMuted },
});
