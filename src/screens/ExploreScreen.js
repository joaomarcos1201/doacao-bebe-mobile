import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, View, Text, TextInput, Pressable, StyleSheet,
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

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;

export default function ExploreScreen({ initialSearch = '', onProductPress }) {
  const { theme } = useTheme();
  const [search, setSearch] = useState(initialSearch);
  const [focused, setFocused] = useState(false);
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
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Todos' || p.categoria === activeCategory;
    const matchSearch = search.trim() === '' || `${p.nome} ${p.descricao || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const count = filtered.length;
  const countLabel = count === 1 ? `${count} item encontrado` : `${count} itens encontrados`;

  return (
    <View style={s.container}>
      {/* Barra de busca */}
      <View style={s.searchBar}>
        <View style={[s.searchWrap, focused && s.searchWrapFocused]}>
          <Ionicons name="search-outline" size={16} color={focused ? colors.primary : colors.primaryMedium} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar produtos..."
            placeholderTextColor={colors.textPlaceholder}
            autoFocus={!!initialSearch}
            autoCorrect={false}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </Pressable>
          )}
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
              <Ionicons name={cat.icon} size={13} color={active ? '#fff' : theme.textMuted} />
              <Text style={[s.catLabel, active && s.catLabelActive]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Resultados */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} tintColor={colors.primary} />}
      >
        {!loading && (
          <Text style={s.resultCount}>{countLabel}</Text>
        )}

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
            <Text style={s.stateHint}>Tente ajustar os filtros ou a pesquisa</Text>
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
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },

  searchBar: {
    backgroundColor: theme.card,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input,
    borderRadius: radius.pill, borderWidth: 1.5,
    borderColor: 'rgba(232,138,162,0.25)',
    paddingHorizontal: spacing.md, height: 44,
  },
  searchWrapFocused: { borderColor: colors.primary },
  searchInput: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },

  catsScroll: { borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  catsContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  },
  catChipActive: { backgroundColor: colors.primary, ...shadows.cta },
  catLabel: { fontSize: typography.label, color: theme.textMuted, fontWeight: typography.medium },
  catLabelActive: { color: '#fff', fontWeight: typography.bold },

  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  resultCount: { fontSize: typography.support, color: theme.textMuted, marginBottom: spacing.md },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    width: CARD_WIDTH, backgroundColor: theme.card,
    borderRadius: radius.lg, borderWidth: 1, borderColor: theme.cardBorder,
    overflow: 'hidden', marginBottom: spacing.lg, ...shadows.light,
  },
  cardImageWrap: { position: 'relative' },
  cardImage: { height: 130, width: '100%' },
  cardImagePlaceholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' },
  favBtn: { position: 'absolute', top: 8, right: 8 },
  cardBody: { padding: spacing.sm, gap: 4 },
  conditionBadge: {
    backgroundColor: 'rgba(22,163,74,0.1)', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.pill, alignSelf: 'flex-start',
  },
  conditionBadgeText: { fontSize: 10, color: colors.successAlt, fontWeight: typography.bold },
  cardName: { fontSize: typography.label, fontWeight: typography.bold, color: theme.text, letterSpacing: -0.2 },
  cardDesc: { fontSize: 11, color: theme.textMuted, lineHeight: 16 },
  cardPrice: { color: colors.primary, fontSize: typography.button, fontWeight: typography.extrabold },
  cardBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingVertical: 8, alignItems: 'center', marginTop: 4,
  },
  cardBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: 12 },
  cardImageSold: { opacity: 0.7 },
  cardBodySold: { opacity: 0.75 },
  cardNameSold: { color: theme.textMuted },
  cardPriceSold: { color: theme.textMuted, textDecorationLine: 'line-through', fontSize: typography.label },
  cardBtnSold: { backgroundColor: theme.isDark ? '#2a2a2a' : '#e5e7eb' },
  cardBtnTextSold: { color: theme.textMuted },

  stateWrap: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  stateHint: { color: theme.textTertiary, fontSize: typography.label, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.body },
});
