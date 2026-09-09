import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, ScrollView, StyleSheet,
  Text, Pressable, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage, productApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import ScreenHeader from '../components/ScreenHeader';
import { isProductAvailable, isProductOwner } from '../utils/productRules';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return 'ontem';
  return `há ${Math.floor(diff / 86400)} dias`;
};

export default function ProductDetailScreen({ onBack, onBuy, productId }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const s = styles(theme);

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError(''); setActiveImage(0);
    productApi.getById(productId)
      .then((res) => { if (mounted) setProduct(res.data); })
      .catch((err) => {
        if (mounted) setError(err.response?.status === 404
          ? 'Produto não encontrado.'
          : getApiErrorMessage(err, 'Não foi possível carregar o produto.'));
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [productId]);

  const photos = product
    ? [product.foto, product.foto2, product.foto3, product.foto4].map(imageUri).filter(Boolean)
    : [];
  const sellerName = product?.vendedor?.nome || product?.doador;
  const isOwnProduct = product && isProductOwner(product, user);
  const isAvailable = isProductAvailable(product);

  return (
    <View style={s.container}>
      <ScreenHeader title="Detalhes do Produto" onBack={onBack} backLabel="Voltar" />

      {loading ? (
        <View style={s.stateWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.stateText}>Carregando produto...</Text>
        </View>
      ) : error ? (
        <View style={s.stateWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={s.stateText}>{error}</Text>
          <Pressable onPress={onBack} style={s.retryBtn}>
            <Text style={s.retryText}>Voltar para Home</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Galeria */}
          <View style={s.gallery}>
            {photos.length
              ? <Image source={{ uri: photos[activeImage] }} style={s.mainImage} resizeMode="cover" />
              : (
                <View style={s.imagePlaceholder}>
                  <Ionicons name="gift-outline" size={72} color={colors.primaryMedium} />
                </View>
              )
            }
            <FavoriteButton productId={product.id} style={s.favBtn} />
          </View>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.thumbsRow}>
              {photos.map((photo, i) => (
                <Pressable key={photo} onPress={() => setActiveImage(i)}>
                  <Image source={{ uri: photo }} style={[s.thumb, i === activeImage && s.thumbActive]} />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Badges */}
          <View style={s.badgesRow}>
            {!!product.categoria && (
              <View style={s.badgeCategory}>
                <Text style={s.badgeCategoryText}>{product.categoria}</Text>
              </View>
            )}
            {!!product.conservacao && (
              <View style={s.badgeCondition}>
                <Text style={s.badgeConditionText}>{product.conservacao}</Text>
              </View>
            )}
          </View>

          {/* Info principal */}
          <View style={s.card}>
            <Text style={s.productName}>{product.nome}</Text>
            {!!product.preco && (
              <Text style={s.price}>R$ {Number(product.preco).toFixed(2).replace('.', ',')}</Text>
            )}
            {!!product.descricao && (
              <Text style={s.productDesc}>{product.descricao}</Text>
            )}
            <View style={s.detailsGrid}>
              {!!product.marca && (
                <View style={s.detailRow}>
                  <Ionicons name="pricetag-outline" size={14} color={theme.textMuted} />
                  <Text style={s.detailLabel}>Marca</Text>
                  <Text style={s.detailValue}>{product.marca}</Text>
                </View>
              )}
              {!!product.cepOrigem && (
                <View style={s.detailRow}>
                  <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                  <Text style={s.detailLabel}>CEP de origem</Text>
                  <Text style={s.detailValue}>{product.cepOrigem}</Text>
                </View>
              )}
              {!!product.dataAnuncio && (
                <View style={s.detailRow}>
                  <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                  <Text style={s.detailLabel}>Publicado</Text>
                  <Text style={s.detailValue}>{formatTime(product.dataAnuncio)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Anunciante */}
          {!!sellerName && (
            <View style={s.card}>
              <View style={s.sellerRow}>
                <View style={s.sellerAvatar}>
                  <Text style={s.sellerAvatarText}>{sellerName.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={s.sellerLabel}>Anunciante</Text>
                  <Text style={s.sellerName}>{sellerName}</Text>
                  <Text style={s.sellerMeta}>Membro da plataforma</Text>
                </View>
              </View>
            </View>
          )}

          {/* Ação de compra */}
          {isOwnProduct ? (
            <View style={s.noticeCard}>
              <Ionicons name="information-circle-outline" size={18} color={theme.textMuted} />
              <Text style={s.noticeText}>Você não pode comprar seu próprio produto.</Text>
            </View>
          ) : isAvailable ? (
            <Pressable
              style={({ pressed }) => [s.buyBtn, pressed && { opacity: 0.85 }]}
              onPress={onBuy}
            >
              <Ionicons name="bag-outline" size={20} color="#fff" />
              <Text style={s.buyBtnText}>Comprar · R$ {Number(product.preco || 0).toFixed(2).replace('.', ',')}</Text>
            </Pressable>
          ) : (
            <View style={s.noticeCard}>
              <Ionicons name="close-circle-outline" size={18} color={colors.error} />
              <Text style={[s.noticeText, { color: colors.error }]}>Este produto não está disponível para compra.</Text>
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  stateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.body },

  scroll: { padding: spacing.lg, gap: spacing.md },

  gallery: {
    height: 280, borderRadius: radius.xl, overflow: 'hidden',
    backgroundColor: theme.pinkLight, position: 'relative',
  },
  mainImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  favBtn: { position: 'absolute', top: 12, right: 12 },

  thumbsRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  thumb: {
    width: 68, height: 68, borderRadius: radius.sm,
    borderWidth: 2, borderColor: 'transparent',
  },
  thumbActive: { borderColor: colors.primary },

  badgesRow: { flexDirection: 'row', gap: spacing.sm },
  badgeCategory: {
    backgroundColor: theme.pinkLight, paddingHorizontal: spacing.md,
    paddingVertical: 4, borderRadius: radius.pill,
  },
  badgeCategoryText: { color: colors.primary, fontSize: typography.support, fontWeight: typography.bold },
  badgeCondition: {
    backgroundColor: 'rgba(22,163,74,0.1)', paddingHorizontal: spacing.md,
    paddingVertical: 4, borderRadius: radius.pill,
  },
  badgeConditionText: { color: colors.successAlt, fontSize: typography.support, fontWeight: typography.bold },

  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.sm, ...shadows.light,
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  productName: {
    fontSize: typography.pageTitle, fontWeight: typography.extrabold,
    color: theme.textTitle, letterSpacing: -0.5,
  },
  price: { color: colors.primary, fontSize: typography.priceMain, fontWeight: typography.black },
  productDesc: { fontSize: typography.body, color: theme.text, lineHeight: 22 },
  detailsGrid: { gap: spacing.sm, marginTop: spacing.xs },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailLabel: { fontSize: typography.label, color: theme.textMuted, flex: 1 },
  detailValue: { fontSize: typography.label, color: theme.text, fontWeight: typography.semibold },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sellerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sellerAvatarText: { color: '#fff', fontSize: 20, fontWeight: typography.bold },
  sellerLabel: { fontSize: typography.support, color: theme.textMuted },
  sellerName: { fontSize: typography.button, fontWeight: typography.bold, color: theme.text },
  sellerMeta: { fontSize: typography.support, color: theme.textMuted },

  buyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    ...shadows.cta,
  },
  buyBtnText: { color: '#fff', fontSize: typography.button, fontWeight: typography.extrabold },

  noticeCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.card, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: theme.cardBorder,
  },
  noticeText: { color: theme.textMuted, fontSize: typography.body, flex: 1 },
});
