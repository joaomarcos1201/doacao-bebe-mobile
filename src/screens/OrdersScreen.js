import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, RefreshControl, ScrollView,
  StyleSheet, Text, Pressable, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, orderApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const date = (value) => {
  if (!value) return 'Data não informada';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Data não informada' : parsed.toLocaleDateString('pt-BR');
};
const paymentLabel = (status) => ({
  PENDENTE: 'Aguardando Pagamento',
  APROVADO: 'Pago',
  REJEITADO: 'Recusado',
  CANCELADO: 'Cancelado',
  ESTORNADO: 'Estornado',
  FINALIZADO: 'Finalizado',
  LIBERADO: 'Liberado',
}[String(status || '').toUpperCase()] || status || 'Status não informado');

export default function OrdersScreen({ onBack, onOrderPress }) {
  const { theme } = useTheme();
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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar seus pedidos.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={s.container}>
      <ScreenHeader title="Meus Pedidos" onBack={onBack} backLabel="Voltar" />
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.stateWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.stateText}>Carregando seus pedidos...</Text>
          </View>
        ) : error ? (
          <View style={s.stateWrap}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={s.stateText}>{error}</Text>
            <Pressable onPress={() => load()} style={s.retryBtn}>
              <Text style={s.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : orders.length === 0 ? (
          <EmptyState
            iconName="bag-outline"
            title="Você ainda não fez nenhuma compra."
            message="Seus pedidos aparecerão aqui após uma compra."
          />
        ) : (
          orders.map((order) => (
            <Pressable
              key={order.id}
              style={({ pressed }) => [s.card, pressed && { opacity: 0.92 }]}
              onPress={() => onOrderPress?.(order.id)}
            >
              <View style={s.cardTop}>
                <View style={s.productRow}>
                  {imageUri(order.produto?.foto)
                    ? <Image source={{ uri: imageUri(order.produto.foto) }} style={s.image} />
                    : (
                      <View style={[s.image, s.imagePlaceholder]}>
                        <Ionicons name="gift-outline" size={26} color={colors.primaryMedium} />
                      </View>
                    )
                  }
                  <View style={s.info}>
                    <Text style={s.orderId}>Pedido #{order.id}</Text>
                    <Text style={s.name} numberOfLines={2}>{order.produto?.nome || 'Produto não disponível'}</Text>
                    <Text style={s.dateTxt}>{date(order.createdAt)}</Text>
                  </View>
                </View>
                <StatusBadge status={order.statusPagamento} label={paymentLabel(order.statusPagamento)} />
              </View>
              <View style={s.values}>
                <View style={s.valueRow}>
                  <Text style={s.valueLabel}>Produto</Text>
                  <Text style={s.valueAmount}>{money(order.valorProduto)}</Text>
                </View>
                <View style={s.valueRow}>
                  <Text style={s.valueLabel}>Frete</Text>
                  <Text style={s.valueAmount}>{money(order.valorFrete)}</Text>
                </View>
                <View style={[s.valueRow, s.totalRow]}>
                  <Text style={s.totalLabel}>Total</Text>
                  <Text style={s.totalAmount}>{money(order.valorTotal)}</Text>
                </View>
              </View>
              <View style={s.cardFooter}>
                <Text style={s.acompanhar}>Acompanhar Pedido</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ))
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.lg, gap: spacing.md,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, alignItems: 'flex-start' },
  productRow: { flex: 1, flexDirection: 'row', gap: spacing.md },
  image: { width: 72, height: 72, borderRadius: radius.md },
  imagePlaceholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 3 },
  orderId: { color: theme.textMuted, fontSize: typography.support },
  name: { color: theme.text, fontSize: typography.button, fontWeight: typography.extrabold, letterSpacing: -0.2 },
  dateTxt: { color: theme.textMuted, fontSize: typography.support },
  values: {
    borderTopWidth: 1, borderTopColor: theme.border,
    paddingTop: spacing.md, gap: spacing.xs,
  },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between' },
  valueLabel: { color: theme.textMuted, fontSize: typography.label },
  valueAmount: { color: theme.text, fontSize: typography.label, fontWeight: typography.bold },
  totalRow: { marginTop: spacing.xs },
  totalLabel: { color: theme.text, fontSize: typography.button, fontWeight: typography.extrabold },
  totalAmount: { color: colors.primary, fontSize: typography.button, fontWeight: typography.black },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
    borderTopWidth: 1, borderTopColor: theme.border, paddingTop: spacing.sm,
  },
  acompanhar: { color: colors.primary, fontSize: typography.label, fontWeight: typography.bold },
  stateWrap: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.body },
});
