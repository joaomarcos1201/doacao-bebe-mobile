import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, View, Text, TouchableOpacity, StyleSheet,
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

const HOW_IT_WORKS = [
  { num: '1', icon: '📦', title: 'Doe itens', desc: 'Cadastre produtos que seu bebê não usa mais.' },
  { num: '2', icon: '👨‍👩‍👧', title: 'Encontre famílias', desc: 'Conecte-se com famílias da sua região.' },
  { num: '3', icon: '💝', title: 'Ajude quem precisa', desc: 'Faça a diferença com um gesto de amor.' },
];

const PUBLIC_STATUSES = ['ATIVO', 'DISPONIVEL', 'APROVADO'];
const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;

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
      setProducts((response.data || []).filter((product) =>
        PUBLIC_STATUSES.includes(String(product.statusAnuncio || '').toUpperCase())
        && String(product.statusVisibilidade || '').toUpperCase() !== 'REMOVIDO'
      ));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os produtos.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.categoria === activeCategory);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} tintColor={theme.pink} />}>

      {/* Hero compacto */}
      <View style={s.hero}>
        <View style={s.heroCircle1} />
        <View style={s.heroCircle2} />
        <View style={s.heroLeft}>
          <View style={s.badge}>
            <Text style={s.badgeText}>DOAÇÕES PARA BEBÊS</Text>
          </View>
          <Text style={s.heroTitle}>
            Conectando quem doa com{' '}
            <Text style={s.heroTitleItalic}>quem precisa</Text>
          </Text>
          <Text style={s.heroSubtitle}>
            Itens gratuitos de famílias da sua região.
          </Text>
          <TouchableOpacity style={s.heroBtn} activeOpacity={0.8} onPress={onDonate}>
            <Text style={s.heroBtnText}>Quero doar</Text>
          </TouchableOpacity>
          <View style={s.features}>
            {['Gratuito', 'Seguro', 'Solidário'].map((f, i) => (
              <View key={i} style={s.featureChip}>
                <Text style={s.featureChipText}>✓ {f}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.heroRight} />
      </View>

      {/* Categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoriesContent}
        style={s.categoriesScroll}
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



      {/* Grid de produtos 2 colunas */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Doações disponíveis</Text>
        <Text style={s.sectionSubtitle}>{filtered.length} itens encontrados</Text>
      </View>

      {loading ? (
        <View style={s.empty}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.emptyText}>Carregando produtos...</Text></View>
      ) : error ? (
        <View style={s.empty}><Text style={s.emptyText}>{error}</Text><TouchableOpacity onPress={() => loadProducts()}><Text style={s.retryText}>Tentar novamente</Text></TouchableOpacity></View>
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Nenhum item nessa categoria.</Text>
        </View>
      ) : (
        <View style={s.productsGrid}>
          {filtered.map((product, index) => (
            <TouchableOpacity key={product.id} style={[s.productCard, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]} onPress={() => onProductPress?.(product.id)} activeOpacity={0.8}>
              <View style={s.imageWrap}>{imageUri(product.foto) ? <Image source={{ uri: imageUri(product.foto) }} style={s.productImage} /> : <View style={s.productImage}><Text style={s.productImageEmoji}>🎁</Text></View>}<FavoriteButton productId={product.id} style={s.favoriteButton} /></View>
              <View style={s.productInfo}>
                <View style={s.productBadges}>
                  <View style={s.productBadge}>
                    <Text style={s.productBadgeText}>{product.conservacao || 'Disponível'}</Text>
                  </View>
                </View>
                <Text style={s.productName} numberOfLines={1}>{product.nome}</Text>
                <Text style={s.productDesc} numberOfLines={2}>{product.descricao || 'Sem descrição.'}</Text>
                {!!product.preco && <Text style={s.productPrice}>R$ {Number(product.preco).toFixed(2).replace('.', ',')}</Text>}
                <View style={s.productBtn}>
                  <Text style={s.productBtnText}>Ver Detalhes</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}


    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },

  // Hero
  hero: {
    backgroundColor: theme.bgSecondary,
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(232,96,122,0.08)', top: -50, right: -50 },
  heroCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(232,96,122,0.06)', bottom: -30, left: -30 },
  heroLeft: { flex: 1, zIndex: 1 },
  badge: {
    backgroundColor: 'rgba(232,96,122,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginBottom: 10,
  },
  badgeText: { color: theme.pink, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: theme.text, lineHeight: 28, marginBottom: 8 },
  heroTitleItalic: { fontStyle: 'italic', color: theme.pink },
  heroSubtitle: { fontSize: 12, color: theme.textMuted, lineHeight: 18, marginBottom: 14 },
  heroBtn: {
    backgroundColor: theme.pink,
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 22, alignSelf: 'flex-start',
    shadowColor: theme.pink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
    marginBottom: 14,
  },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  features: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  featureChip: {
    backgroundColor: 'rgba(232,96,122,0.12)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 12,
  },
  featureChipText: { color: theme.pink, fontSize: 11, fontWeight: '600' },
  heroRight: {
    width: 90, height: 90,
    backgroundColor: 'rgba(232,96,122,0.12)',
    borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 16,
  },
  heroEmoji: { fontSize: 44 },

  // Categorias
  categoriesScroll: { borderBottomWidth: 1, borderBottomColor: theme.border },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: theme.border,
    backgroundColor: theme.bg,
  },
  catBtnActive: { borderColor: theme.pink, backgroundColor: 'rgba(232,96,122,0.1)' },
  catIcon: { fontSize: 14 },
  catLabel: { fontSize: 13, color: theme.textMuted, fontWeight: '500' },
  catLabelActive: { color: theme.pink, fontWeight: '700' },

  // Seção
  sectionHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  sectionSubtitle: { fontSize: 12, color: theme.textMuted, marginTop: 2 },

  // Como funciona
  howContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  howCard: {
    width: 150,
    backgroundColor: theme.card,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center',
  },
  howNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.pink,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  howNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  howIcon: { fontSize: 26, marginBottom: 6 },
  howTitle: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 4, textAlign: 'center' },
  howDesc: { fontSize: 11, color: theme.textMuted, textAlign: 'center', lineHeight: 16 },

  // Grid 2 colunas
  productsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: theme.card,
    borderRadius: 16, borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden', marginBottom: 16,
  },
  productImage: {
    height: 120,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  imageWrap: { position: 'relative' },
  favoriteButton: { position: 'absolute', top: 8, right: 8 },
  productImageEmoji: { fontSize: 44 },
  productInfo: { padding: 10 },
  productBadges: { flexDirection: 'row', marginBottom: 4 },
  productBadge: {
    backgroundColor: 'rgba(72,187,120,0.15)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  productBadgeText: { fontSize: 10, color: '#2d8a5e', fontWeight: '600' },
  productName: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 3 },
  productDesc: { fontSize: 11, color: theme.textMuted, lineHeight: 16, marginBottom: 8 },
  productBtn: {
    backgroundColor: theme.pink, borderRadius: 10,
    paddingVertical: 7, alignItems: 'center',
  },
  productBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  productPrice: { color: theme.pink, fontSize: 14, fontWeight: '800', marginBottom: 8 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: theme.textMuted, fontSize: 14 },
  retryText: { color: theme.pink, fontWeight: '700', fontSize: 14, marginTop: 10 },

  // Footer
  footer: {
    padding: 24, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: theme.border,
    gap: 8, marginTop: 8,
  },
  footerText: { color: theme.textMuted, fontSize: 12 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLink: { color: theme.pink, fontSize: 12 },
  footerSep: { color: theme.textMuted },
});
