import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, productApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = [
  { label: 'Todos' },
  { label: 'Roupas' },
  { label: 'Brinquedos' },
  { label: 'Móveis' },
  { label: 'Acessórios' },
  { label: 'Alimentação' },
  { label: 'Outros' },
];

const PUBLIC_STATUSES = ['ATIVO', 'DISPONIVEL', 'APROVADO'];
const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;

export default function ExploreScreen({ initialSearch = '', onProductPress }) {
  const { theme } = useTheme();
  const [search, setSearch] = useState(initialSearch);
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
      setProducts((response.data || []).filter((p) => PUBLIC_STATUSES.includes(String(p.statusAnuncio || '').toUpperCase()) && String(p.statusVisibilidade || '').toUpperCase() !== 'REMOVIDO'));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os produtos.'));
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = products.filter(p => {
    const matchCategory = activeCategory === 'Todos' || p.categoria === activeCategory;
    const matchSearch = search.trim() === '' || `${p.nome} ${p.descricao || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={s.container}>
      {/* Busca */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar produtos..."
          placeholderTextColor={theme.textMuted}
          autoFocus={!!initialSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categorias */}
      <View style={s.categoriesScroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[s.catBtn, activeCategory === cat.label && s.catBtnActive]}
              onPress={() => setActiveCategory(cat.label)}
              activeOpacity={0.7}
            >
              <Text style={[s.catLabel, activeCategory === cat.label && s.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Resultado */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} tintColor={theme.pink} />}>
        <Text style={s.resultCount}>{filtered.length} itens encontrados</Text>
        {loading ? <View style={s.empty}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.emptyText}>Carregando produtos...</Text></View> : error ? <View style={s.empty}><Text style={s.emptyText}>{error}</Text><TouchableOpacity onPress={() => loadProducts()}><Text style={s.retryText}>Tentar novamente</Text></TouchableOpacity></View> : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>Nenhum item encontrado.</Text>
          </View>
        ) : (
          <View style={s.grid}>
            {filtered.map((product, index) => (
              <View
                key={product.id}
                style={[s.card, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
              >
                <TouchableOpacity onPress={() => onProductPress?.(product.id)} activeOpacity={0.8}>
                <View style={s.imageWrap}>{imageUri(product.foto) ? <Image source={{ uri: imageUri(product.foto) }} style={s.cardImage} /> : <View style={s.cardImage}><Text style={s.cardImageEmoji}>🎁</Text></View>}<FavoriteButton productId={product.id} style={s.favoriteButton} /></View>
                <View style={s.cardInfo}>
                  <View style={s.cardBadge}>
                    <Text style={s.cardBadgeText}>{product.conservacao || 'Disponível'}</Text>
                  </View>
                  <Text style={s.cardName} numberOfLines={1}>{product.nome}</Text>
                  <Text style={s.cardDesc} numberOfLines={2}>{product.descricao || 'Sem descrição.'}</Text>
                  <View style={s.cardBtn}>
                    <Text style={s.cardBtnText}>Ver Detalhes</Text>
                  </View>
                </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' },

  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: { color: theme.pink, fontSize: 15, fontWeight: '600', width: 50 },
  navTitle: { fontSize: 16, fontWeight: '700', color: theme.text },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, paddingHorizontal: 12,
    backgroundColor: theme.card, borderRadius: 12,
    borderWidth: 1, borderColor: theme.border,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: theme.text },
  clearBtn: { color: theme.textMuted, fontSize: 16, padding: 4 },

  categoriesScroll: { borderBottomWidth: 1, borderBottomColor: theme.border },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
  catBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: theme.border,
    backgroundColor: theme.bg, height: 36, justifyContent: 'center',
  },
  catBtnActive: { borderColor: theme.pink, backgroundColor: 'rgba(232,96,122,0.1)' },
  catLabel: { fontSize: 13, color: theme.textMuted, fontWeight: '500' },
  catLabelActive: { color: theme.pink, fontWeight: '700' },

  scroll: { padding: 16 },
  resultCount: { fontSize: 12, color: theme.textMuted, marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    width: CARD_WIDTH, backgroundColor: theme.card,
    borderRadius: 16, borderWidth: 1, borderColor: theme.border,
    overflow: 'hidden', marginBottom: 16,
  },
  cardImage: { height: 120, backgroundColor: theme.pinkLight },
  imageWrap: { position: 'relative' },
  favoriteButton: { position: 'absolute', top: 8, right: 8 },
  cardImageEmoji: { fontSize: 42, textAlign: 'center', paddingTop: 32 },
  cardInfo: { padding: 10 },
  cardBadge: {
    backgroundColor: 'rgba(72,187,120,0.15)',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 4,
  },
  cardBadgeText: { fontSize: 10, color: '#2d8a5e', fontWeight: '600' },
  cardName: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 3 },
  cardDesc: { fontSize: 11, color: theme.textMuted, lineHeight: 16, marginBottom: 8 },
  cardBtn: {
    backgroundColor: theme.pink, borderRadius: 10,
    paddingVertical: 7, alignItems: 'center',
  },
  cardBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: theme.textMuted, fontSize: 14 },
  retryText: { color: theme.pink, fontWeight: '700', fontSize: 14, marginTop: 10 },
});
