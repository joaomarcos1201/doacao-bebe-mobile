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
const paymentLabel = (value) => ({
  PENDENTE: 'Pendente', APROVADO: 'Aprovado', FINALIZADO: 'Finalizado',
  LIBERADO: 'Saldo liberado', REJEITADO: 'Rejeitado', CANCELADO: 'Cancelado', ESTORNADO: 'Estornado',
}[String(value || '').toUpperCase()] || value || 'Não informado');

const shippingLabel = (value) => ({
  AGUARDANDO_POSTAGEM: 'Aguardando postagem', POSTADO: 'Postado',
  EM_TRANSITO: 'Em trânsito', SAIU_ENTREGA: 'Saiu para entrega', ENTREGUE: 'Entregue',
}[String(value || '').toUpperCase()] || value || 'Envio não informado');

export default function SalesScreen({ onBack, onSalePress }) {
  const { theme } = useTheme();
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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar suas vendas.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={s.container}>
      <ScreenHeader title="Minhas Vendas" onBack={onBack} backLabel="Voltar" />
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.stateWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.stateText}>Carregando suas vendas...</Text>
          </View>
        ) : error ? (
          <View style={s.stateWrap}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={s.stateText}>{error}</Text>
            <Pressable onPress={() => load()} style={s.retryBtn}>
              <Text style={s.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : sales.length === 0 ? (
          <EmptyState
            iconName="storefront-outline"
            title="Você ainda não possui vendas."
            message="As vendas dos seus anúncios aparecerão aqui."
          />
        ) : (
          sales.map((sale) => (
            <Pressable
              key={sale.id}
              style={({ pressed }) => [s.card, pressed && { opacity: 0.92 }]}
              onPress={() => onSalePress?.(sale.id)}
            >
              <View style={s.cardTop}>
                <View style={s.productRow}>
                  {imageUri(sale.produto?.foto)
                    ? <Image source={{ uri: imageUri(sale.produto.foto) }} style={s.image} />
                    : <View style={[s.image, s.imagePlaceholder]}><Ionicons name="gift-outline" size={26} color={colors.primaryMedium} /></View>
                  }
                  <View style={s.info}>
                    <Text style={s.orderId}>Pedido #{sale.id}</Text>
                    <Text style={s.name} numberOfLines={2}>{sale.produto?.nome || 'Produto não disponível'}</Text>
                    <Text style={s.buyer}>Comprador: {sale.comprador?.nome || 'Não informado'}</Text>
                    <Text style={s.dateTxt}>{date(sale.createdAt)}</Text>
                  </View>
                </View>
                <StatusBadge status={sale.statusPagamento} label={paymentLabel(sale.statusPagamento)} />
              </View>

              <View style={s.values}>
                <View style={s.valueRow}>
                  <Text style={s.valueLabel}>Produto</Text>
                  <Text style={s.valueAmount}>{money(sale.valorProduto)}</Text>
                </View>
                <View style={s.valueRow}>
                  <Text style={s.valueLabel}>Frete</Text>
                  <Text style={s.valueAmount}>{money(sale.valorFrete)}</Text>
                </View>
                <View style={[s.valueRow, s.totalRow]}>
                  <Text style={s.totalLabel}>Total</Text>
                  <Text style={s.totalAmount}>{money(sale.valorTotal)}</Text>
                </View>
              </View>

              {!!sale.statusEnvio && (
                <View style={s.shippingRow}>
                  <Ionicons name="car-outline" size={14} color={theme.textMuted} />
                  <Text style={s.shippingText}>{shippingLabel(sale.statusEnvio)}</Text>
                </View>
              )}
              {!!sale.codigoRastreio && (
                <View style={s.shippingRow}>
                  <Ionicons name="barcode-outline" size={14} color={theme.textMuted} />
                  <Text style={s.shippingText}>Rastreio: {sale.codigoRastreio}</Text>
                </View>
              )}

              <View style={s.cardFooter}>
                <Text style={s.detailLink}>Ver detalhes</Text>
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
  buyer: { color: theme.textMuted, fontSize: typography.support },
  dateTxt: { color: theme.textMuted, fontSize: typography.support },
  values: { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: spacing.md, gap: spacing.xs },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between' },
  valueLabel: { color: theme.textMuted, fontSize: typography.label },
  valueAmount: { color: theme.text, fontSize: typography.label, fontWeight: typography.bold },
  totalRow: { marginTop: spacing.xs },
  totalLabel: { color: theme.text, fontSize: typography.button, fontWeight: typography.extrabold },
  totalAmount: { color: colors.primary, fontSize: typography.button, fontWeight: typography.black },
  shippingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shippingText: { color: theme.textMuted, fontSize: typography.label },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
    borderTopWidth: 1, borderTopColor: theme.border, paddingTop: spacing.sm,
  },
  detailLink: { color: colors.primary, fontSize: typography.label, fontWeight: typography.bold },
  stateWrap: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold },
});
