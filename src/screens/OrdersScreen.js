import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, orderApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const date = (value) => {
  if (!value) return 'Data não informada';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Data não informada' : parsed.toLocaleDateString('pt-BR');
};

const paymentLabel = (status) => ({
  PENDENTE: 'Pagamento pendente',
  APROVADO: 'Pagamento aprovado',
  REJEITADO: 'Pagamento rejeitado',
  CANCELADO: 'Pagamento cancelado',
  ESTORNADO: 'Pagamento estornado',
  FINALIZADO: 'Pagamento finalizado',
  LIBERADO: 'Pagamento liberado',
}[String(status || '').toUpperCase()] || status || 'Status não informado');

export default function OrdersScreen({ onBack, onOrderPress }) {
  const { theme, toggleTheme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await orderApi.listMine();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar seus pedidos.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <View style={s.container}>
    <ScreenHeader title="Meus Pedidos" onBack={onBack} />
    <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.pink} />}>
      {loading ? <View style={s.state}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.muted}>Carregando seus pedidos...</Text></View> : error ? <View style={s.state}><Text style={s.error}>{error}</Text><TouchableOpacity onPress={() => load()}><Text style={s.retry}>Tentar novamente</Text></TouchableOpacity></View> : orders.length === 0 ? <EmptyState icon="□" title="Você ainda não possui pedidos." message="Seus pedidos aparecerão aqui após uma compra." /> : orders.map((order) => <TouchableOpacity key={order.id} style={s.card} onPress={() => onOrderPress?.(order.id)} activeOpacity={0.8}><View style={s.cardTop}><View style={s.productWrap}>{imageUri(order.produto?.foto) ? <Image source={{ uri: imageUri(order.produto.foto) }} style={s.image} /> : <View style={[s.image, s.placeholder]}><Text style={s.placeholderText}>🎁</Text></View>}<View style={s.info}><Text style={s.orderId}>Pedido #{order.id}</Text><Text style={s.name} numberOfLines={2}>{order.produto?.nome || 'Produto não disponível'}</Text><Text style={s.muted}>{date(order.createdAt)}</Text></View></View><StatusBadge status={order.statusPagamento} label={paymentLabel(order.statusPagamento)} /></View><View style={s.values}><Text style={s.valueLabel}>Produto <Text style={s.value}>{money(order.valorProduto)}</Text></Text><Text style={s.valueLabel}>Frete <Text style={s.value}>{money(order.valorFrete)}</Text></Text><Text style={s.total}>Total {money(order.valorTotal)}</Text></View></TouchableOpacity>)}
    </ScrollView>
  </View>;
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }, navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border }, back: { color: theme.pink, fontWeight: '700' }, title: { color: theme.text, fontSize: 17, fontWeight: '800' }, theme: { fontSize: 20 }, scroll: { padding: 16, gap: 12, flexGrow: 1 }, card: { backgroundColor: theme.card, borderRadius: 18, padding: 14, gap: 14 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, productWrap: { flex: 1, flexDirection: 'row', gap: 12 }, image: { width: 72, height: 72, borderRadius: 12 }, placeholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' }, placeholderText: { fontSize: 28 }, info: { flex: 1, gap: 4 }, orderId: { color: theme.textMuted, fontSize: 12 }, name: { color: theme.text, fontSize: 15, fontWeight: '800' }, muted: { color: theme.textMuted, fontSize: 13 }, status: { color: theme.pink, fontSize: 12, fontWeight: '800', textAlign: 'right', maxWidth: 125 }, values: { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, gap: 6 }, valueLabel: { color: theme.textMuted, fontSize: 13 }, value: { color: theme.text, fontWeight: '700' }, total: { color: theme.pink, fontSize: 17, fontWeight: '900', marginTop: 3 }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }, error: { color: '#c43d54', textAlign: 'center', fontWeight: '600' }, retry: { color: theme.pink, fontWeight: '800' }, emptyIcon: { color: theme.pink, fontSize: 42 }, emptyTitle: { color: theme.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
});
