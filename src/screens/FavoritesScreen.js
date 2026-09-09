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
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
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
  const countLabel = count === 1 ? `${count} produto salvo` : `${count} produtos salvos`;

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
            <Text style={s.countLabel}>{countLabel}</Text>
            {products.map((product) => (
              <Pressable
                key={product.id}
                style={({ pressed }) => [s.card, pressed && { opacity: 0.92 }]}
                onPress={() => onProductPress?.(product.id)}
              >
                {imageUri(product.foto)
                  ? <Image source={{ uri: imageUri(product.foto) }} style={s.image} />
                  : (
                    <View style={[s.image, s.imagePlaceholder]}>
                      <Ionicons name="gift-outline" size={28} color={colors.primaryMedium} />
                    </View>
                  )
                }
                <View style={s.info}>
                  {!!product.categoria && (
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeText}>{product.categoria}</Text>
                    </View>
                  )}
                  <Text style={s.name} numberOfLines={1}>{product.nome}</Text>
                  {!!product.preco && (
                    <Text style={s.price}>R$ {Number(product.preco).toFixed(2).replace('.', ',')}</Text>
                  )}
                  <Text style={s.muted} numberOfLines={1}>{product.descricao || 'Sem descrição.'}</Text>
                </View>
                <FavoriteButton
                  productId={product.id}
                  onChanged={(active) => {
                    if (!active) setProducts((curr) => curr.filter((item) => item.id !== product.id));
                  }}
                />
              </Pressable>
            ))}
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
  image: { width: 80, height: 80, borderRadius: radius.md },
  imagePlaceholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  catBadge: {
    backgroundColor: theme.pinkLight, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: radius.pill, alignSelf: 'flex-start',
  },
  catBadgeText: { color: colors.primary, fontSize: 10, fontWeight: typography.bold },
  name: { color: theme.text, fontSize: typography.button, fontWeight: typography.bold, letterSpacing: -0.2 },
  price: { color: colors.primary, fontSize: typography.body, fontWeight: typography.extrabold },
  muted: { color: theme.textMuted, fontSize: typography.support },
  stateWrap: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  stateText: { color: theme.textMuted, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm },
  retryText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.body },
});
