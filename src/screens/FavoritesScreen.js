import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, RefreshControl, ScrollView,
  StyleSheet, Text, Pressable, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { favoriteApi, getApiErrorMessage } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';
import SoldBadge from '../components/SoldBadge';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { isProductSold } from '../utils/productRules';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;

export default function FavoritesScreen({ onBack, onProductPress }) {
  const { theme } = useTheme();
  const { loadFavoriteIds } = useFavorites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await favoriteApi.list();
      setProducts(Array.isArray(response.data) ? response.data : []);
      await loadFavoriteIds();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar seus favoritos.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, [loadFavoriteIds]);

  useEffect(() => { load(); }, [load]);

  const count = products.length;
  const soldCount = products.filter(isProductSold).length;
  const countLabel = count === 1 ? `${count} produto salvo` : `${count} produtos salvos`;
  const soldLabel = soldCount > 0 ? ` · ${soldCount} vendido${soldCount > 1 ? 's' : ''}` : '';

  return (
    <View style={s.container}>
      <ScreenHeader title="Meus Favoritos" onBack={onBack} backLabel="Voltar" />

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.stateWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.stateText}>Carregando favoritos...</Text>
          </View>
        ) : error ? (
          <View style={s.stateWrap}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={s.stateText}>{error}</Text>
            <Pressable onPress={() => load()} style={s.retryBtn}>
              <Text style={s.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : products.length === 0 ? (
          <EmptyState
            iconName="heart-outline"
            title="Nenhum favorito ainda"
            message="Explore os produtos e toque no coração para salvar os que você mais gostou."
          />
        ) : (
          <>
            <Text style={s.countLabel}>{countLabel}{soldLabel}</Text>
            {products.map((product) => {
              const sold = isProductSold(product);
              return (
              <Pressable
                key={product.id}
                style={({ pressed }) => [s.card, sold && s.cardSold, pressed && { opacity: 0.92 }]}
                onPress={() => onProductPress?.(product.id)}
              >
                <View style={s.imageWrap}>
                  {imageUri(product.foto)
                    ? <Image source={{ uri: imageUri(product.foto) }} style={[s.image, sold && s.imageSold]} />
                    : (
                      <View style={[s.image, s.imagePlaceholder]}>
                        <Ionicons name="gift-outline" size={28} color={colors.primaryMedium} />
                      </View>
                    )
                  }
                  {sold && (
                    <View style={s.soldOverlay}>
                      <Text style={s.soldOverlayText}>VENDIDO</Text>
                    </View>
                  )}
                </View>
                <View style={s.info}>
                  {sold ? (
                    <View style={s.soldInlineBadge}>
                      <Text style={s.soldInlineBadgeText}>Vendido</Text>
                    </View>
                  ) : !!product.categoria && (
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeText}>{product.categoria}</Text>
                    </View>
                  )}
                  <Text style={[s.name, sold && s.nameSold]} numberOfLines={1}>{product.nome}</Text>
                  {!!product.preco && (
                    <Text style={[s.price, sold && s.priceSold]}>
                      R$ {Number(product.preco).toFixed(2).replace('.', ',')}
                    </Text>
                  )}
                  {!sold && (
                    <Text style={s.muted} numberOfLines={1}>{product.descricao || 'Sem descrição.'}</Text>
                  )}
                </View>
                <FavoriteButton
                  productId={product.id}
                  onChanged={(active) => {
                    if (!active) setProducts((curr) => curr.filter((item) => item.id !== product.id));
                  }}
                />
              </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  countLabel: { fontSize: typography.support, color: theme.textMuted, marginBottom: spacing.xs },
  card: {
    backgroundColor: theme.card, borderRadius: radius.lg,
    padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardSold: { borderColor: theme.isDark ? '#2a2a2a' : '#e5e7eb', opacity: 0.85 },
  imageWrap: { position: 'relative' },
  image: { width: 80, height: 80, borderRadius: radius.md },
  imageSold: { opacity: 0.6 },
  imagePlaceholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOverlayText: {
    color: '#fff', fontSize: 9, fontWeight: typography.extrabold, letterSpacing: 1.2,
  },
  soldInlineBadge: {
    backgroundColor: theme.isDark ? '#2a2a2a' : '#f3f4f6',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.pill, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: theme.isDark ? '#3a3a3a' : '#d1d5db',
  },
  soldInlineBadgeText: { color: theme.textMuted, fontSize: 10, fontWeight: typography.bold, letterSpacing: 0.5 },
  info: { flex: 1, gap: 4 },
  catBadge: {
    backgroundColor: theme.pinkLight, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: radius.pill, alignSelf: 'flex-start',
  },
  catBadgeText: { color: colors.primary, fontSize: 10, fontWeight: typography.bold },
  name: { color: theme.text, fontSize: typography.button, fontWeight: typography.bold, letterSpacing: -0.2 },
  nameSold: { color: theme.textMuted },
  price: { color: colors.primary, fontSize: typography.body, fontWeight: typography.extrabold },
  priceSold: { color: theme.textMuted, textDecorationLine: 'line-through', fontSize: typography.label },
  muted: { color: theme.textMuted, fontSize: typography.support },
  stateWrap: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.body },
});
