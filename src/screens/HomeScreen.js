import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, View, Text, Pressable, StyleSheet,
  ScrollView, Dimensions, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, productApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import SoldBadge from '../components/SoldBadge';
import { isProductSold, isProductVisible } from '../utils/productRules';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = [
  { label: 'Todos', icon: 'grid-outline' },
  { label: 'Roupas', icon: 'shirt-outline' },
  { label: 'Brinquedos', icon: 'game-controller-outline' },
  { label: 'Móveis', icon: 'bed-outline' },
  { label: 'Acessórios', icon: 'bag-outline' },
  { label: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

const FEATURES = [
  { icon: 'pricetag-outline', title: 'Preços acessíveis', desc: 'Peças com ótimo custo-benefício' },
  { icon: 'shield-checkmark-outline', title: 'Compra segura', desc: 'Anúncios verificados com cuidado' },
  { icon: 'people-outline', title: 'Comunidade de pais', desc: 'Encontre tudo para o bebê com facilidade' },
];

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

export default function HomeScreen({ onDonate, onProductPress }) {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await productApi.list();
      setProducts((response.data || []).filter(isProductVisible));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os produtos.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.categoria === activeCategory);

  const count = filtered.length;
  const countLabel = count === 1 ? `${count} item encontrado` : `${count} itens encontrados`;

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} tintColor={colors.primary} />}
    >
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroDecor1} />
        <View style={s.heroDecor2} />
        <View style={s.heroBadgeRow}>
          <View style={s.heroBadge}>
            <Ionicons name="heart" size={10} color={colors.primary} />
            <Text style={s.heroBadgeText}>ALÉM DO POSITIVO</Text>
          </View>
        </View>
        <Text style={s.heroTitle}>
          Encontre roupas e acessórios{'\n'}
          <Text style={s.heroTitleAccent}>para o seu bebê</Text>
        </Text>
        <Text style={s.heroSubtitle}>
          Descubra peças lindas, confortáveis e com ótimo preço em sua região.
        </Text>
        <Pressable
          style={({ pressed }) => [s.heroBtn, pressed && { opacity: 0.85 }]}
          onPress={onDonate}
        >
          <Ionicons name="megaphone-outline" size={16} color="#fff" />
          <Text style={s.heroBtnText}>Anunciar Produto</Text>
        </Pressable>
        <View style={s.featuresRow}>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureItem}>
              <Ionicons name={f.icon} size={14} color={colors.primary} />
              <Text style={s.featureText}>{f.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catsContent}
        style={s.catsScroll}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.label;
          return (
            <Pressable
              key={cat.label}
              style={({ pressed }) => [s.catChip, active && s.catChipActive, pressed && { opacity: 0.8 }]}
              onPress={() => setActiveCategory(cat.label)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={active ? '#fff' : theme.textMuted}
              />
              <Text style={[s.catLabel, active && s.catLabelActive]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Seção produtos */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Anúncios</Text>
        {!loading && <Text style={s.sectionCount}>{countLabel}</Text>}
      </View>

      {loading ? (
        <View style={s.stateWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.stateText}>Carregando produtos...</Text>
        </View>
      ) : error ? (
        <View style={s.stateWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={s.stateText}>{error}</Text>
          <Pressable onPress={() => loadProducts()} style={s.retryBtn}>
            <Text style={s.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.stateWrap}>
          <Ionicons name="search-outline" size={40} color={theme.textMuted} />
          <Text style={s.stateText}>Nenhum item encontrado</Text>
          <Text style={[s.stateText, { fontSize: typography.label }]}>Tente ajustar os filtros ou a pesquisa</Text>
        </View>
      ) : (
        <View style={s.grid}>
          {filtered.map((product, index) => (
            <Pressable
              key={product.id}
              style={({ pressed }) => [
                s.card,
                index % 2 === 0 ? { marginRight: spacing.sm } : { marginLeft: spacing.sm },
                pressed && { opacity: 0.92 },
              ]}
              onPress={() => onProductPress?.(product.id)}
            >
              {(() => {
                const sold = isProductSold(product);
                const reserved = !sold && String(product.statusAnuncio || '').toUpperCase() === 'RESERVADO';
                return (
                  <>
                    <View style={s.cardImageWrap}>
                      {imageUri(product.foto)
                        ? <Image source={{ uri: imageUri(product.foto) }} style={[s.cardImage, sold && s.cardImageSold]} />
                        : (
                          <View style={[s.cardImage, s.cardImagePlaceholder]}>
                            <Ionicons name="gift-outline" size={36} color={colors.primaryMedium} />
                          </View>
                        )
                      }
                      {sold ? (
                        <SoldBadge variant="overlay" />
                      ) : (
                        <FavoriteButton productId={product.id} style={s.favBtn} />
                      )}
                      {reserved && (
                        <View style={s.reservedBadge}>
                          <Text style={s.reservedBadgeText}>Reservado</Text>
                        </View>
                      )}
                    </View>
                    <View style={[s.cardBody, sold && s.cardBodySold]}>
                      {!!product.conservacao && !sold && (
                        <View style={s.conditionBadge}>
                          <Text style={s.conditionBadgeText}>{product.conservacao}</Text>
                        </View>
                      )}
                      <Text style={[s.cardName, sold && s.cardNameSold]} numberOfLines={1}>{product.nome}</Text>
                      {!!product.preco && (
                        <Text style={[s.cardPrice, sold && s.cardPriceSold]}>
                          R$ {Number(product.preco).toFixed(2).replace('.', ',')}
                        </Text>
                      )}
                      {!sold && !!product.dataAnuncio && (
                        <Text style={s.cardTime}>{formatTime(product.dataAnuncio)}</Text>
                      )}
                      <View style={[s.cardBtn, sold && s.cardBtnSold]}>
                        <Text style={[s.cardBtnText, sold && s.cardBtnTextSold]}>
                          {sold ? 'Vendido' : 'Ver Detalhes'}
                        </Text>
                      </View>
                    </View>
                  </>
                );
              })()}
            </Pressable>
          ))}
        </View>
      )}

      <View style={s.bottomPad} />
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },

  // Hero
  hero: {
    backgroundColor: theme.isDark ? '#1a0a0c' : '#fff7f9',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    overflow: 'hidden',
    position: 'relative',
    gap: spacing.md,
  },
  heroDecor1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(192,96,106,0.07)', top: -60, right: -60,
  },
  heroDecor2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(232,138,162,0.06)', bottom: -40, left: -40,
  },
  heroBadgeRow: { flexDirection: 'row' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.pinkLight,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    color: colors.primary, fontSize: 10,
    fontWeight: typography.extrabold, letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22, fontWeight: typography.extrabold,
    color: theme.textTitle, lineHeight: 30, letterSpacing: -0.5,
  },
  heroTitleAccent: { color: colors.primary },
  heroSubtitle: {
    fontSize: typography.label, color: theme.textMuted,
    lineHeight: 20,
  },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl, paddingVertical: 13,
    borderRadius: radius.pill, alignSelf: 'flex-start',
    ...shadows.cta,
  },
  heroBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.button },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  featureItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.pinkSurface,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  featureText: { color: colors.primary, fontSize: 11, fontWeight: typography.semibold },

  // Categorias
  catsScroll: { borderBottomWidth: 1, borderBottomColor: theme.border },
  catsContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  },
  catChipActive: {
    backgroundColor: colors.primary,
    ...shadows.cta,
  },
  catLabel: { fontSize: typography.label, color: theme.textMuted, fontWeight: typography.medium },
  catLabelActive: { color: '#fff', fontWeight: typography.bold },

  // Seção
  sectionHeader: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
  },
  sectionTitle: {
    fontSize: typography.cardTitle, fontWeight: typography.extrabold,
    color: theme.textTitle, letterSpacing: -0.3,
  },
  sectionCount: { fontSize: typography.support, color: theme.textMuted },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.light,
  },
  cardImageWrap: { position: 'relative' },
  cardImage: { height: 130, width: '100%' },
  cardImagePlaceholder: {
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  favBtn: { position: 'absolute', top: 8, right: 8 },
  reservedBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.pill,
  },
  reservedBadgeText: { color: '#fff', fontSize: 10, fontWeight: typography.bold },
  cardBody: { padding: spacing.sm, gap: 4 },
  conditionBadge: {
    backgroundColor: 'rgba(22,163,74,0.1)',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.pill, alignSelf: 'flex-start',
  },
  conditionBadgeText: { fontSize: 10, color: colors.successAlt, fontWeight: typography.bold },
  cardName: {
    fontSize: typography.label, fontWeight: typography.bold,
    color: theme.text, letterSpacing: -0.2,
  },
  cardDesc: { fontSize: 11, color: theme.textMuted, lineHeight: 16 },
  cardPrice: {
    color: colors.primary, fontSize: typography.button,
    fontWeight: typography.extrabold,
  },
  cardTime: { fontSize: 10, color: theme.textTertiary },
  cardBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm, paddingVertical: 8,
    alignItems: 'center', marginTop: 4,
  },
  cardBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: 12 },

  cardImageSold: { opacity: 0.7 },
  cardBodySold: { opacity: 0.75 },
  cardNameSold: { color: theme.textMuted },
  cardPriceSold: { color: theme.textMuted, textDecorationLine: 'line-through', fontSize: typography.label },
  cardBtnSold: { backgroundColor: theme.isDark ? '#2a2a2a' : '#e5e7eb' },
  cardBtnTextSold: { color: theme.textMuted },

  // Estados
  stateWrap: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.body },

  bottomPad: { height: spacing.xl },
});
