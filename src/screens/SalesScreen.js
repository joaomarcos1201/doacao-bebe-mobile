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
const paymentLabel = (value) => ({
  PENDENTE: 'Pendente', APROVADO: 'Aprovado', FINALIZADO: 'Finalizado',
  LIBERADO: 'Saldo liberado', REJEITADO: 'Rejeitado', CANCELADO: 'Cancelado', ESTORNADO: 'Estornado',
}[String(value || '').toUpperCase()] || value || 'Não informado');
const shippingLabel = (value) => ({
  AGUARDANDO_POSTAGEM: 'Aguardando postagem', POSTADO: 'Postado', EM_TRANSITO: 'Em trânsito',
  SAIU_ENTREGA: 'Saiu para entrega', ENTREGUE: 'Entregue',
}[String(value || '').toUpperCase()] || value || 'Envio ainda não informado');

export default function SalesScreen({ onBack, onSalePress }) {
  const { theme, toggleTheme } = useTheme();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await orderApi.listSales();
      setSales(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar suas vendas.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <View style={s.container}>
    <ScreenHeader title="Minhas Vendas" onBack={onBack} />
    <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.pink} />}>
      {loading ? <View style={s.state}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.muted}>Carregando suas vendas...</Text></View> : error ? <View style={s.state}><Text style={s.error}>{error}</Text><TouchableOpacity onPress={() => load()}><Text style={s.retry}>Tentar novamente</Text></TouchableOpacity></View> : sales.length === 0 ? <EmptyState icon="▱" title="Você ainda não possui vendas." message="As vendas dos seus anúncios aparecerão aqui." /> : sales.map((sale) => <TouchableOpacity key={sale.id} style={s.card} onPress={() => onSalePress?.(sale.id)} activeOpacity={0.8}><View style={s.cardTop}><View style={s.productWrap}>{imageUri(sale.produto?.foto) ? <Image source={{ uri: imageUri(sale.produto.foto) }} style={s.image} /> : <View style={[s.image, s.placeholder]}><Text style={s.placeholderText}>🎁</Text></View>}<View style={s.info}><Text style={s.orderId}>Pedido #{sale.id}</Text><Text style={s.name} numberOfLines={2}>{sale.produto?.nome || 'Produto não disponível'}</Text><Text style={s.muted}>Comprador: {sale.comprador?.nome || 'Não informado'}</Text><Text style={s.muted}>{date(sale.createdAt)}</Text></View></View><StatusBadge status={sale.statusPagamento} label={paymentLabel(sale.statusPagamento)} /></View><View style={s.values}><Text style={s.valueLabel}>Produto <Text style={s.value}>{money(sale.valorProduto)}</Text></Text><Text style={s.valueLabel}>Frete <Text style={s.value}>{money(sale.valorFrete)}</Text></Text><Text style={s.total}>Total {money(sale.valorTotal)}</Text></View><Text style={s.shipping}>{shippingLabel(sale.statusEnvio)}</Text>{sale.codigoRastreio && <Text style={s.muted}>Rastreio: {sale.codigoRastreio}</Text>}</TouchableOpacity>)}
    </ScrollView>
  </View>;
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }, navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border }, back: { color: theme.pink, fontWeight: '700' }, title: { color: theme.text, fontSize: 17, fontWeight: '800' }, theme: { fontSize: 20 }, scroll: { padding: 16, gap: 12, flexGrow: 1 }, card: { backgroundColor: theme.card, borderRadius: 18, padding: 14, gap: 12 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, productWrap: { flex: 1, flexDirection: 'row', gap: 12 }, image: { width: 72, height: 72, borderRadius: 12 }, placeholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' }, placeholderText: { fontSize: 28 }, info: { flex: 1, gap: 4 }, orderId: { color: theme.textMuted, fontSize: 12 }, name: { color: theme.text, fontSize: 15, fontWeight: '800' }, muted: { color: theme.textMuted, fontSize: 13 }, status: { color: '#c57a16', fontSize: 12, fontWeight: '800', textAlign: 'right', maxWidth: 110 }, approved: { color: '#3aaa6e' }, values: { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 10, gap: 5 }, valueLabel: { color: theme.textMuted, fontSize: 13 }, value: { color: theme.text, fontWeight: '700' }, total: { color: theme.pink, fontSize: 17, fontWeight: '900' }, shipping: { color: theme.text, fontSize: 13, fontWeight: '700' }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }, error: { color: '#c43d54', textAlign: 'center', fontWeight: '600' }, retry: { color: theme.pink, fontWeight: '800' }, emptyIcon: { color: theme.pink, fontSize: 42 }, emptyTitle: { color: theme.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
});
