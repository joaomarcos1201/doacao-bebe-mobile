import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, orderApi } from '../services/api';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const status = (value) => value || 'Não informado';
const date = (value) => {
  if (!value) return 'Não informado';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Não informado' : parsed.toLocaleString('pt-BR');
};

export default function OrderDetailScreen({ onBack, orderId }) {
  const { theme, toggleTheme } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await orderApi.getById(orderId);
      setOrder(response.data);
    } catch (requestError) {
      setError(requestError.response?.status === 404 ? 'Pedido não encontrado.' : getApiErrorMessage(requestError, 'Não foi possível carregar o pedido.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const info = (label, value) => <View style={s.infoRow} key={label}><Text style={s.infoLabel}>{label}</Text><Text style={s.infoValue}>{value}</Text></View>;

  return <View style={s.container}>
    <View style={s.navbar}><TouchableOpacity onPress={onBack}><Text style={s.back}>← Pedidos</Text></TouchableOpacity><Text style={s.title}>Detalhes do Pedido</Text><TouchableOpacity onPress={toggleTheme}><Text style={s.theme}>{theme.isDark ? '☀️' : '🌙'}</Text></TouchableOpacity></View>
    {loading ? <View style={s.state}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.muted}>Carregando pedido...</Text></View> : error ? <View style={s.state}><Text style={s.error}>{error}</Text><TouchableOpacity onPress={() => load()}><Text style={s.retry}>Tentar novamente</Text></TouchableOpacity></View> : <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.pink} />}>
      <View style={s.productCard}>{imageUri(order?.produto?.foto) ? <Image source={{ uri: imageUri(order.produto.foto) }} style={s.image} /> : <View style={[s.image, s.placeholder]}><Text style={s.placeholderText}>🎁</Text></View>}<View style={s.productInfo}><Text style={s.orderId}>Pedido #{order?.id}</Text><Text style={s.productName}>{order?.produto?.nome || 'Produto não disponível'}</Text></View></View>
      <View style={s.card}><Text style={s.cardTitle}>Status</Text>{info('Pagamento', status(order?.statusPagamento))}{info('Envio', status(order?.statusEnvio))}</View>
      <View style={s.card}><Text style={s.cardTitle}>Valores</Text>{info('Produto', money(order?.valorProduto))}{info('Frete', money(order?.valorFrete))}{info('Total', money(order?.valorTotal))}</View>
      <View style={s.card}><Text style={s.cardTitle}>Entrega e pedido</Text>{info('Data do pedido', date(order?.createdAt))}{info('Código de rastreio', status(order?.codigoRastreio))}{info('Transportadora', status(order?.transportadora))}</View>
    </ScrollView>}
  </View>;
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }, navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border }, back: { color: theme.pink, fontWeight: '700' }, title: { color: theme.text, fontSize: 16, fontWeight: '800' }, theme: { fontSize: 20 }, scroll: { padding: 16, gap: 12 }, productCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.card, borderRadius: 18, padding: 14 }, image: { width: 84, height: 84, borderRadius: 12 }, placeholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' }, placeholderText: { fontSize: 30 }, productInfo: { flex: 1, gap: 6 }, orderId: { color: theme.textMuted, fontSize: 12 }, productName: { color: theme.text, fontSize: 18, fontWeight: '800' }, card: { backgroundColor: theme.card, borderRadius: 18, padding: 18, gap: 12 }, cardTitle: { color: theme.text, fontSize: 16, fontWeight: '800' }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 8 }, infoLabel: { color: theme.textMuted, fontSize: 14, flex: 1 }, infoValue: { color: theme.text, fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }, muted: { color: theme.textMuted, fontSize: 14 }, error: { color: '#c43d54', textAlign: 'center', fontWeight: '600' }, retry: { color: theme.pink, fontWeight: '800' },
});
