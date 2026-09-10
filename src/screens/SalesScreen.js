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

const imageUri = (v) => v ? `data:image/jpeg;base64,${v}` : null;
const money = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR');
};

const PAYMENT_LABELS = {
  PENDENTE: 'Pendente', APROVADO: 'Aprovado', FINALIZADO: 'Finalizado',
  LIBERADO: 'Saldo liberado', REJEITADO: 'Rejeitado',
  CANCELADO: 'Cancelado', ESTORNADO: 'Estornado',
};
const paymentLabel = (v) => PAYMENT_LABELS[String(v || '').toUpperCase()] || v || '—';

const SHIPPING_LABELS = {
  AGUARDANDO_POSTAGEM: 'Aguardando postagem', POSTADO: 'Postado',
  EM_TRANSITO: 'Em trânsito', SAIU_ENTREGA: 'Saiu para entrega', ENTREGUE: 'Entregue',
};
const shippingLabel = (v) => SHIPPING_LABELS[String(v || '').toUpperCase()] || v || null;

function SaleSummaryBar({ sales }) {
  const total = sales.reduce((acc, s) => acc + Number(s.valorTotal || 0), 0);
  const finalized = sales.filter((s) =>
    ['FINALIZADO', 'LIBERADO', 'APROVADO'].includes(String(s.statusPagamento || '').toUpperCase())
  ).length;

  return (
    <View style={summaryStyles.bar}>
      <View style={summaryStyles.item}>
        <Text style={summaryStyles.value}>{sales.length}</Text>
        <Text style={summaryStyles.label}>{sales.length === 1 ? 'venda' : 'vendas'}</Text>
      </View>
      <View style={summaryStyles.divider} />
      <View style={summaryStyles.item}>
        <Text style={[summaryStyles.value, { color: colors.successAlt }]}>{finalized}</Text>
        <Text style={summaryStyles.label}>concluídas</Text>
      </View>
      <View style={summaryStyles.divider} />
      <View style={summaryStyles.item}>
        <Text style={[summaryStyles.value, { color: colors.primary }]}>{money(total)}</Text>
        <Text style={summaryStyles.label}>em vendas</Text>
      </View>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg,
    ...shadows.cta,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  value: { color: '#fff', fontSize: typography.cardTitle, fontWeight: typography.extrabold, letterSpacing: -0.5 },
  label: { color: 'rgba(255,255,255,0.75)', fontSize: typography.support },
  divider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
});

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
      const res = await orderApi.listSales();
      setSales(Array.isArray(res.data) ? res.data : []);
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
            <Ionicons name="alert-circle-outline" size={44} color={colors.error} />
            <Text style={s.stateTitle}>Não foi possível carregar</Text>
            <Text style={s.stateText}>{error}</Text>
            <Pressable onPress={() => load()} style={s.retryBtn}>
              <Text style={s.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : sales.length === 0 ? (
          <EmptyState
            iconName="storefront-outline"
            title="Nenhuma venda ainda"
            message="Quando seus anúncios forem vendidos, o histórico aparecerá aqui."
          />
        ) : (
          <>
            <SaleSummaryBar sales={sales} />
            {sales.map((sale) => {
              const saleDate = formatDate(sale.createdAt);
              const shipping = shippingLabel(sale.statusEnvio);
              const photo = imageUri(sale.produto?.foto);
              return (
                <Pressable
                  key={sale.id}
                  style={({ pressed }) => [s.card, pressed && { opacity: 0.93 }]}
                  onPress={() => onSalePress?.(sale.id)}
                >
                  {/* Topo: foto + info + status */}
                  <View style={s.cardTop}>
                    <View style={s.photoWrap}>
                      {photo
                        ? <Image source={{ uri: photo }} style={s.photo} />
                        : (
                          <View style={[s.photo, s.photoPlaceholder]}>
                            <Ionicons name="gift-outline" size={24} color={colors.primaryMedium} />
                          </View>
                        )
                      }
                      <View style={s.soldPill}>
                        <Text style={s.soldPillText}>VENDIDO</Text>
                      </View>
                    </View>

                    <View style={s.mainInfo}>
                      <Text style={s.pedidoId}>Pedido #{sale.id}</Text>
                      <Text style={s.productName} numberOfLines={2}>
                        {sale.produto?.nome || 'Produto não disponível'}
                      </Text>
                      <Text style={s.totalValue}>{money(sale.valorTotal)}</Text>
                      {!!saleDate && (
                        <View style={s.dateRow}>
                          <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
                          <Text style={s.dateText}>Vendido em {saleDate}</Text>
                        </View>
                      )}
                    </View>

                    <StatusBadge status={sale.statusPagamento} label={paymentLabel(sale.statusPagamento)} />
                  </View>

                  {/* Linha divisória */}
                  <View style={s.divider} />

                  {/* Valores */}
                  <View style={s.valuesRow}>
                    <View style={s.valueItem}>
                      <Text style={s.valueLabel}>Produto</Text>
                      <Text style={s.valueAmount}>{money(sale.valorProduto)}</Text>
                    </View>
                    <View style={s.valueItem}>
                      <Text style={s.valueLabel}>Frete</Text>
                      <Text style={s.valueAmount}>{money(sale.valorFrete)}</Text>
                    </View>
                    <View style={[s.valueItem, s.valueItemTotal]}>
                      <Text style={s.valueLabelTotal}>Total</Text>
                      <Text style={s.valueAmountTotal}>{money(sale.valorTotal)}</Text>
                    </View>
                  </View>

                  {/* Comprador + envio */}
                  {(!!sale.comprador?.nome || !!shipping || !!sale.codigoRastreio) && (
                    <View style={s.metaRow}>
                      {!!sale.comprador?.nome && (
                        <View style={s.metaItem}>
                          <Ionicons name="person-outline" size={13} color={theme.textMuted} />
                          <Text style={s.metaText} numberOfLines={1}>{sale.comprador.nome}</Text>
                        </View>
                      )}
                      {!!shipping && (
                        <View style={s.metaItem}>
                          <Ionicons name="car-outline" size={13} color={theme.textMuted} />
                          <Text style={s.metaText}>{shipping}</Text>
                        </View>
                      )}
                      {!!sale.codigoRastreio && (
                        <View style={s.metaItem}>
                          <Ionicons name="barcode-outline" size={13} color={theme.textMuted} />
                          <Text style={s.metaText}>Rastreio: {sale.codigoRastreio}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Footer */}
                  <View style={s.cardFooter}>
                    <Text style={s.detailLink}>Ver detalhes</Text>
                    <Ionicons name="chevron-forward" size={15} color={colors.primary} />
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingTop: spacing.lg, gap: spacing.md, flexGrow: 1 },

  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: theme.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    ...shadows.light,
  },

  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },

  photoWrap: { position: 'relative', flexShrink: 0 },
  photo: { width: 76, height: 76, borderRadius: radius.md },
  photoPlaceholder: {
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  soldPill: {
    position: 'absolute', bottom: -6, left: '50%',
    transform: [{ translateX: -24 }],
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  soldPillText: {
    color: '#fff', fontSize: 8,
    fontWeight: typography.extrabold, letterSpacing: 1,
  },

  mainInfo: { flex: 1, gap: 3 },
  pedidoId: { color: theme.textMuted, fontSize: typography.support },
  productName: {
    color: theme.text, fontSize: typography.button,
    fontWeight: typography.extrabold, letterSpacing: -0.2, lineHeight: 20,
  },
  totalValue: {
    color: colors.primary, fontSize: typography.cardTitle,
    fontWeight: typography.black, letterSpacing: -0.5,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dateText: { color: theme.textMuted, fontSize: typography.support },

  divider: { height: 1, backgroundColor: theme.border, marginHorizontal: spacing.lg },

  valuesRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  valueItem: { flex: 1, gap: 2 },
  valueItemTotal: {
    borderLeftWidth: 1, borderLeftColor: theme.border,
    paddingLeft: spacing.sm,
  },
  valueLabel: { color: theme.textMuted, fontSize: typography.support },
  valueAmount: { color: theme.text, fontSize: typography.label, fontWeight: typography.bold },
  valueLabelTotal: { color: theme.text, fontSize: typography.support, fontWeight: typography.semibold },
  valueAmountTotal: { color: colors.primary, fontSize: typography.button, fontWeight: typography.black },

  metaRow: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { color: theme.textMuted, fontSize: typography.support, flex: 1 },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 4, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: theme.border,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  },
  detailLink: { color: colors.primary, fontSize: typography.label, fontWeight: typography.bold },

  stateWrap: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: spacing.xl, gap: spacing.sm },
  stateTitle: { color: theme.text, fontSize: typography.button, fontWeight: typography.bold },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: 10,
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary,
  },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.label },
});
