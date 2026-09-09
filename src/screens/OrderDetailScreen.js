import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Linking, RefreshControl,
  ScrollView, StyleSheet, Text, Pressable, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, orderApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const dateStr = (value) => {
  if (!value) return 'Não informado';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Não informado' : parsed.toLocaleString('pt-BR');
};

const TIMELINE = [
  { status: 'PENDENTE', label: 'Aguardando Pagamento', icon: 'time-outline' },
  { status: 'APROVADO', label: 'Pago', icon: 'checkmark-circle-outline' },
  { status: 'AGUARDANDO_POSTAGEM', label: 'Produto separado', icon: 'cube-outline' },
  { status: 'POSTADO', label: 'Enviado', icon: 'send-outline' },
  { status: 'EM_TRANSITO', label: 'Em trânsito', icon: 'car-outline' },
  { status: 'SAIU_ENTREGA', label: 'Saiu para entrega', icon: 'bicycle-outline' },
  { status: 'ENTREGUE', label: 'Entregue', icon: 'home-outline' },
];

export default function OrderDetailScreen({ onBack, orderId }) {
  const { theme } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const s = styles(theme);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await orderApi.getById(orderId);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.status === 404
        ? 'Pedido não encontrado.'
        : getApiErrorMessage(err, 'Não foi possível carregar o pedido.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const handleCopyTracking = () => {
    if (order?.codigoRastreio) {
      Alert.alert('Código copiado', 'Código de rastreio copiado.');
    }
  };

  const handleTrack = async () => {
    const url = 'https://rastreamento.correios.com.br/app/index.php';
    try { await Linking.openURL(url); } catch { /* ok */ }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Pedido',
      'Tem certeza de que deseja cancelar este pedido? Esta ação não poderá ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar', style: 'destructive',
          onPress: async () => {
            setCancelLoading(true);
            try {
              await orderApi.cancel(orderId);
              await load(true);
            } catch (err) {
              Alert.alert('Erro', getApiErrorMessage(err, 'Não foi possível cancelar o pedido.'));
            } finally { setCancelLoading(false); }
          },
        },
      ]
    );
  };

  const InfoRow = ({ label, value }) => (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || 'Não informado'}</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <ScreenHeader title="Detalhes do Pedido" onBack={onBack} backLabel="Pedidos" />

      {loading ? (
        <View style={s.stateWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.stateText}>Carregando pedido...</Text>
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
            {imageUri(order?.produto?.foto)
              ? <Image source={{ uri: imageUri(order.produto.foto) }} style={s.image} />
              : <View style={[s.image, s.imagePlaceholder]}><Ionicons name="gift-outline" size={28} color={colors.primaryMedium} /></View>
            }
            <View style={s.productInfo}>
              <Text style={s.orderId}>Pedido #{order?.id}</Text>
              <Text style={s.productName}>{order?.produto?.nome || 'Produto não disponível'}</Text>
              <StatusBadge status={order?.statusPagamento} label={order?.statusPagamento || 'Não informado'} />
            </View>
          </View>

          {/* Timeline */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Acompanhar Pedido</Text>
            {TIMELINE.map((step, i) => {
              const statuses = [order?.statusPagamento, order?.statusEnvio].map(v => String(v || '').toUpperCase());
              const done = statuses.includes(step.status);
              return (
                <View key={step.status} style={s.timelineRow}>
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, done && s.timelineDotDone]}>
                      <Ionicons name={step.icon} size={13} color={done ? '#fff' : theme.textMuted} />
                    </View>
                    {i < TIMELINE.length - 1 && <View style={[s.timelineLine, done && s.timelineLineDone]} />}
                  </View>
                  <Text style={[s.timelineLabel, done && s.timelineLabelDone]}>{step.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Valores */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Valores</Text>
            <InfoRow label="Produto" value={money(order?.valorProduto)} />
            <InfoRow label="Frete" value={money(order?.valorFrete)} />
            <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={[s.infoLabel, { color: theme.text, fontWeight: typography.extrabold }]}>Total</Text>
              <Text style={[s.infoValue, { color: colors.primary, fontWeight: typography.black }]}>{money(order?.valorTotal)}</Text>
            </View>
          </View>

          {/* Rastreio */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Entrega</Text>
            <InfoRow label="Data do pedido" value={dateStr(order?.createdAt)} />
            <InfoRow label="Código de rastreio" value={order?.codigoRastreio || 'Ainda não gerado'} />
            <InfoRow label="Transportadora" value={order?.transportadora || 'Não informada'} />
            {!!order?.codigoRastreio && (
              <View style={s.trackingActions}>
                <Pressable style={({ pressed }) => [s.trackBtn, pressed && { opacity: 0.8 }]} onPress={handleCopyTracking}>
                  <Ionicons name="copy-outline" size={15} color={colors.primary} />
                  <Text style={s.trackBtnText}>Copiar código de rastreio</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [s.trackBtn, pressed && { opacity: 0.8 }]} onPress={handleTrack}>
                  <Ionicons name="open-outline" size={15} color={colors.primary} />
                  <Text style={s.trackBtnText}>Rastrear na transportadora</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Cancelar */}
          {['PENDENTE', 'APROVADO'].includes(String(order?.statusPagamento || '').toUpperCase()) && (
            <Pressable
              style={({ pressed }) => [s.cancelBtn, cancelLoading && s.btnDisabled, pressed && { opacity: 0.8 }]}
              onPress={handleCancel}
              disabled={cancelLoading}
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.error} />
              <Text style={s.cancelBtnText}>{cancelLoading ? 'Cancelando...' : 'Cancelar Pedido'}</Text>
            </Pressable>
          )}

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
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, minHeight: 36 },
  timelineLeft: { alignItems: 'center', width: 28 },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: colors.primary },
  timelineLine: { width: 2, flex: 1, minHeight: 8, backgroundColor: theme.border, marginTop: 2 },
  timelineLineDone: { backgroundColor: colors.primary },
  timelineLabel: { fontSize: typography.label, color: theme.textMuted, paddingTop: 6 },
  timelineLabelDone: { color: theme.text, fontWeight: typography.semibold },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: spacing.sm,
  },
  infoLabel: { color: theme.textMuted, fontSize: typography.label, flex: 1 },
  infoValue: { color: theme.text, fontSize: typography.label, fontWeight: typography.bold, flex: 1, textAlign: 'right' },
  trackingActions: { gap: spacing.sm, marginTop: spacing.xs },
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.primary,
  },
  trackBtnText: { color: colors.primary, fontSize: typography.label, fontWeight: typography.semibold },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: 14, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.55)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  cancelBtnText: { color: colors.error, fontSize: typography.button, fontWeight: typography.bold },
  btnDisabled: { opacity: 0.6 },
});
