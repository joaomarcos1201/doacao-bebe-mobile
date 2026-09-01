import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { favoriteApi, getApiErrorMessage } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;

export default function FavoritesScreen({ onBack, onProductPress }) {
  const { theme, toggleTheme } = useTheme();
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
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar seus favoritos.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, [loadFavoriteIds]);

  useEffect(() => { load(); }, [load]);

  return <View style={s.container}>
    <View style={s.navbar}><TouchableOpacity onPress={onBack}><Text style={s.backBtn}>← Voltar</Text></TouchableOpacity><Text style={s.title}>♥ Favoritos</Text><TouchableOpacity onPress={toggleTheme}><Text style={s.themeBtn}>{theme.isDark ? '☀️' : '🌙'}</Text></TouchableOpacity></View>
    <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.pink} />}>
      {loading ? <View style={s.state}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.muted}>Carregando favoritos...</Text></View> : error ? <View style={s.state}><Text style={s.muted}>{error}</Text><TouchableOpacity onPress={() => load()}><Text style={s.retry}>Tentar novamente</Text></TouchableOpacity></View> : products.length === 0 ? <View style={s.state}><Text style={s.emptyIcon}>♡</Text><Text style={s.emptyTitle}>Você ainda não possui produtos favoritos.</Text><Text style={s.muted}>Toque no coração de um produto para salvá-lo aqui.</Text></View> : products.map((product) => <View key={product.id} style={s.card}><TouchableOpacity style={s.cardMain} onPress={() => onProductPress?.(product.id)} activeOpacity={0.8}>{imageUri(product.foto) ? <Image source={{ uri: imageUri(product.foto) }} style={s.image} /> : <View style={[s.image, s.placeholder]}><Text style={s.placeholderText}>🎁</Text></View>}<View style={s.info}><Text style={s.name} numberOfLines={1}>{product.nome}</Text>{!!product.preco && <Text style={s.price}>R$ {Number(product.preco).toFixed(2).replace('.', ',')}</Text>}<Text style={s.muted} numberOfLines={1}>{product.categoria || 'Produto'}</Text></View></TouchableOpacity><FavoriteButton productId={product.id} onChanged={(active) => { if (!active) setProducts((current) => current.filter((item) => item.id !== product.id)); }} /></View>)}
    </ScrollView>
  </View>;
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { color: theme.pink, fontSize: 15, fontWeight: '600' }, title: { color: theme.pink, fontSize: 17, fontWeight: '800' }, themeBtn: { fontSize: 20 }, scroll: { padding: 16, gap: 12 },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }, cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, image: { width: 76, height: 76, borderRadius: 12 }, placeholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' }, placeholderText: { fontSize: 30 }, info: { flex: 1, gap: 4 }, name: { color: theme.text, fontSize: 15, fontWeight: '700' }, price: { color: theme.pink, fontSize: 14, fontWeight: '800' }, muted: { color: theme.textMuted, fontSize: 13, textAlign: 'center' }, state: { alignItems: 'center', padding: 48, gap: 10 }, emptyIcon: { color: theme.pink, fontSize: 54 }, emptyTitle: { color: theme.text, fontSize: 16, fontWeight: '700', textAlign: 'center' }, retry: { color: theme.pink, fontWeight: '700' },
});
