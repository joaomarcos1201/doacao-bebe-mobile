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
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const imageUri = (v) => v ? `data:image/jpeg;base64,${v}` : null;
const money = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (v) => {
  if (!v) return 'Não informado';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 'Não informado' : d.toLocaleString('pt-BR');
};
const fallback = (v) => v || 'Não informado';

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
const shippingLabel = (v) => SHIPPING_LABELS[String(v || '').toUpperCase()] || v || 'Não informado';

function InfoRow({ label, value, highlight }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, highlight && infoStyles.valueHighlight]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  label: { color: '#6B7280', fontSize: typography.label, flex: 1 },
  value: { color: '#111827', fontSize: typography.label, fontWeight: typography.semibold, flex: 1, textAlign: 'right' },
  valueHighlight: { color: colors.primary, fontWeight: typography.black, fontSize: typography.button },
});

export default function SaleDetailScreen({ onBack, saleId }) {
  const { theme } = useTheme();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      setSale((await orderApi.getById(saleId)).data);
    } catch (err) {
      setError(err.response?.status === 404
        ? 'Venda não encontrada.'
        : getApiErrorMessage(err, 'Não foi possível carregar a venda.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, [saleId]);

  useEffect(() => { load(); }, [load]);

  const photo = imageUri(sale?.produto?.foto);

  return (
    <View style={s.container}>
      <ScreenHeader title="Detalhes da Venda" onBack={onBack} backLabel="Vendas" />

      {loading ? (
        <View style={s.stateWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.stateText}>Carregando venda...</Text>
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
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero do produto */}
          <View style={s.heroCard}>
            <View style={s.heroImageWrap}>
              {photo
                ? <Image source={{ uri: photo }} style={s.heroImage} resizeMode="cover" />
                : (
                  <View style={[s.heroImage, s.heroImagePlaceholder]}>
                    <Ionicons name="gift-outline" size={40} color={colors.primaryMedium} />
                  </View>
                )
              }
              {/* Overlay VENDIDO */}
              <View style={s.soldOverlay}>
                <View style={s.soldPill}>
                  <Text style={s.soldPillText}>VENDIDO</Text>
                </View>
              </View>
            </View>

            <View style={s.heroInfo}>
              <Text style={s.pedidoId}>Pedido #{sale?.id}</Text>
              <Text style={s.productName}>{sale?.produto?.nome || 'Produto não disponível'}</Text>
              <Text style={s.totalHero}>{money(sale?.valorTotal)}</Text>
              <View style={s.statusRow}>
                <StatusBadge
                  status={sale?.statusPagamento}
                  label={paymentLabel(sale?.statusPagamento)}
                />
              </View>
            </View>
          </View>

          {/* Valores */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              <Text style={s.cardTitle}>Resumo financeiro</Text>
            </View>
            <InfoRow label="Valor do produto" value={money(sale?.valorProduto)} />
            <InfoRow label="Frete" value={money(sale?.valorFrete)} />
            <View style={[infoStyles.row, { borderBottomWidth: 0, paddingTop: spacing.sm }]}>
              <Text style={[infoStyles.label, { color: theme.text, fontWeight: typography.bold }]}>Total recebido</Text>
              <Text style={[infoStyles.value, infoStyles.valueHighlight]}>{money(sale?.valorTotal)}</Text>
            </View>
          </View>

          {/* Comprador e pagamento */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
              <Text style={s.cardTitle}>Comprador e pagamento</Text>
            </View>
            <InfoRow label="Comprador" value={fallback(sale?.comprador?.nome)} />
            <InfoRow label="Status do pagamento" value={paymentLabel(sale?.statusPagamento)} />
          </View>

          {/* Entrega */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="car-outline" size={18} color={colors.primary} />
              <Text style={s.cardTitle}>Entrega</Text>
            </View>
            <InfoRow label="Status do envio" value={shippingLabel(sale?.statusEnvio)} />
            <InfoRow label="Código de rastreio" value={fallback(sale?.codigoRastreio)} />
            <InfoRow label="Transportadora" value={fallback(sale?.transportadora)} />
          </View>

          {/* Datas */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={s.cardTitle}>Datas</Text>
            </View>
            <InfoRow label="Data do pedido" value={formatDate(sale?.createdAt)} />
            {!!sale?.updatedAt && sale.updatedAt !== sale.createdAt && (
              <InfoRow label="Última atualização" value={formatDate(sale.updatedAt)} />
            )}
          </View>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.md },

  stateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  stateTitle: { color: theme.text, fontSize: typography.button, fontWeight: typography.bold },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: 10,
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary,
  },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.label },

  heroCard: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: theme.cardBorder,
    overflow: 'hidden', ...shadows.light,
  },
  heroImageWrap: { position: 'relative', height: 200 },
  heroImage: { width: '100%', height: '100%' },
  heroImagePlaceholder: {
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  soldPill: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  soldPillText: {
    color: '#fff', fontSize: typography.button,
    fontWeight: typography.extrabold, letterSpacing: 3,
  },
  heroInfo: {
    padding: spacing.xl, gap: spacing.sm,
  },
  pedidoId: { color: theme.textMuted, fontSize: typography.support },
  productName: {
    color: theme.text, fontSize: typography.cardTitle,
    fontWeight: typography.extrabold, letterSpacing: -0.3, lineHeight: 26,
  },
  totalHero: {
    color: colors.primary, fontSize: typography.priceMain,
    fontWeight: typography.black, letterSpacing: -1,
  },
  statusRow: { flexDirection: 'row' },

  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.xs,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.button, fontWeight: typography.extrabold,
    color: theme.textTitle, letterSpacing: -0.2,
  },
});
