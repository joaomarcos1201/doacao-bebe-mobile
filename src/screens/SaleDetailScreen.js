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

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const dateStr = (value) => value ? new Date(value).toLocaleString('pt-BR') : 'Não informado';
const fallback = (value) => value || 'Não informado';

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
    try { setSale((await orderApi.getById(saleId)).data); }
    catch (err) {
      setError(err.response?.status === 404
        ? 'Venda não encontrada.'
        : getApiErrorMessage(err, 'Não foi possível carregar a venda.'));
    }
    finally { setLoading(false); setRefreshing(false); }
  }, [saleId]);

  useEffect(() => { load(); }, [load]);

  const InfoRow = ({ label, value }) => (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{fallback(value)}</Text>
    </View>
  );

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
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
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
          {/* Produto */}
          <View style={s.productCard}>
            {imageUri(sale?.produto?.foto)
              ? <Image source={{ uri: imageUri(sale.produto.foto) }} style={s.image} />
              : <View style={[s.image, s.imagePlaceholder]}><Ionicons name="gift-outline" size={28} color={colors.primaryMedium} /></View>
            }
            <View style={s.productInfo}>
              <Text style={s.orderId}>Pedido #{sale?.id}</Text>
              <Text style={s.productName}>{sale?.produto?.nome || 'Produto não disponível'}</Text>
              <StatusBadge status={sale?.statusPagamento} label={sale?.statusPagamento || 'Não informado'} />
            </View>
          </View>

          {/* Comprador e status */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Comprador e Status</Text>
            <InfoRow label="Comprador" value={sale?.comprador?.nome} />
            <InfoRow label="Pagamento" value={sale?.statusPagamento} />
            <InfoRow label="Envio" value={sale?.statusEnvio} />
          </View>

          {/* Valores */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Valores</Text>
            <InfoRow label="Produto" value={money(sale?.valorProduto)} />
            <InfoRow label="Frete" value={money(sale?.valorFrete)} />
            <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={[s.infoLabel, { color: theme.text, fontWeight: typography.extrabold }]}>Total</Text>
              <Text style={[s.infoValue, { color: colors.primary, fontWeight: typography.black }]}>{money(sale?.valorTotal)}</Text>
            </View>
          </View>

          {/* Entrega */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Entrega e Pedido</Text>
            <InfoRow label="Data do pedido" value={dateStr(sale?.createdAt)} />
            <InfoRow label="Código de rastreio" value={sale?.codigoRastreio} />
            <InfoRow label="Transportadora" value={sale?.transportadora} />
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.md },
  stateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold },
  productCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  image: { width: 84, height: 84, borderRadius: radius.md },
  imagePlaceholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, gap: spacing.sm },
  orderId: { color: theme.textMuted, fontSize: typography.support },
  productName: { color: theme.text, fontSize: typography.cardTitle, fontWeight: typography.extrabold, letterSpacing: -0.3 },
  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.sm,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: theme.textTitle, marginBottom: spacing.xs },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: spacing.sm,
  },
  infoLabel: { color: theme.textMuted, fontSize: typography.label, flex: 1 },
  infoValue: { color: theme.text, fontSize: typography.label, fontWeight: typography.bold, flex: 1, textAlign: 'right' },
});
