import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage, productApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import { isProductAvailable, isProductOwner } from '../utils/productRules';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;

export default function ProductDetailScreen({ onBack, onBuy, productId }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const s = styles(theme);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    setActiveImage(0);
    productApi.getById(productId).then((response) => {
      if (mounted) setProduct(response.data);
    }).catch((requestError) => {
      if (mounted) setError(requestError.response?.status === 404 ? 'Produto não encontrado.' : getApiErrorMessage(requestError, 'Não foi possível carregar o produto.'));
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [productId]);

  const photos = product ? [product.foto, product.foto2, product.foto3, product.foto4].map(imageUri).filter(Boolean) : [];
  const sellerName = product?.vendedor?.nome || product?.doador;
  const isOwnProduct = product && isProductOwner(product, user);
  const isAvailable = isProductAvailable(product);

  return (
    <View style={s.container}>
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}><Text style={s.backBtn}>← Voltar</Text></TouchableOpacity>
        <Text style={s.navTitle}>Detalhes do Produto</Text>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}><Text style={s.themeBtn}>{theme.isDark ? '☀️' : '🌙'}</Text></TouchableOpacity>
      </View>
      {loading ? <View style={s.state}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.stateText}>Carregando produto...</Text></View> : error ? <View style={s.state}><Text style={s.stateText}>{error}</Text><TouchableOpacity onPress={onBack}><Text style={s.backLink}>Voltar para Home</Text></TouchableOpacity></View> : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.gallery}>{photos.length ? <Image source={{ uri: photos[activeImage] }} style={s.mainImage} resizeMode="cover" /> : <Text style={s.imageEmoji}>🎁</Text>}<FavoriteButton productId={product.id} style={s.favoriteButton} /></View>
          {photos.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.thumbnails}>{photos.map((photo, index) => <TouchableOpacity key={photo} onPress={() => setActiveImage(index)}><Image source={{ uri: photo }} style={[s.thumbnail, index === activeImage && s.thumbnailActive]} /></TouchableOpacity>)}</ScrollView>}
          <View style={s.badges}>
            {!!product.categoria && <View style={s.badgeCategory}><Text style={s.badgeCategoryText}>{product.categoria}</Text></View>}
            {!!product.conservacao && <View style={s.badgeCondition}><Text style={s.badgeConditionText}>{product.conservacao}</Text></View>}
          </View>
          <View style={s.card}>
            <Text style={s.productName}>{product.nome}</Text>
            {!!product.preco && <Text style={s.price}>R$ {Number(product.preco).toFixed(2).replace('.', ',')}</Text>}
            {!!product.descricao && <Text style={s.productDesc}>{product.descricao}</Text>}
            {!!product.marca && <Text style={s.detail}><Text style={s.detailLabel}>Marca: </Text>{product.marca}</Text>}
            {!!product.cepOrigem && <Text style={s.detail}><Text style={s.detailLabel}>CEP de origem: </Text>{product.cepOrigem}</Text>}
            {!!product.dataAnuncio && <Text style={s.detail}><Text style={s.detailLabel}>Publicado em: </Text>{new Date(product.dataAnuncio).toLocaleDateString('pt-BR')}</Text>}
          </View>
          {!!sellerName && <View style={s.card}><Text style={s.cardTitle}>Anunciante</Text><Text style={s.seller}>{sellerName}</Text></View>}
          {isOwnProduct ? <View style={s.purchaseNotice}><Text style={s.purchaseNoticeText}>Você não pode comprar seu próprio produto.</Text></View> : isAvailable ? <TouchableOpacity style={s.buyButton} onPress={onBuy} activeOpacity={0.85}><Text style={s.buyButtonText}>Comprar</Text></TouchableOpacity> : <View style={s.purchaseNotice}><Text style={s.purchaseNoticeText}>Este produto não está disponível para compra.</Text></View>}
        </ScrollView>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { color: theme.pink, fontSize: 15, fontWeight: '600' }, navTitle: { fontSize: 16, fontWeight: '700', color: theme.text }, themeBtn: { fontSize: 20 },
  scroll: { padding: 16, gap: 12 }, gallery: { height: 260, borderRadius: 20, overflow: 'hidden', backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' }, mainImage: { width: '100%', height: '100%' }, imageEmoji: { fontSize: 80 },
  favoriteButton: { position: 'absolute', top: 10, right: 10 },
  thumbnails: { gap: 8 }, thumbnail: { width: 64, height: 64, borderRadius: 10, borderWidth: 2, borderColor: 'transparent' }, thumbnailActive: { borderColor: theme.pink }, badges: { flexDirection: 'row', gap: 8 },
  badgeCategory: { backgroundColor: 'rgba(232,96,122,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }, badgeCategoryText: { color: theme.pink, fontSize: 12, fontWeight: '600' }, badgeCondition: { backgroundColor: 'rgba(58,170,110,0.12)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }, badgeConditionText: { color: '#3aaa6e', fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: theme.card, borderRadius: 20, padding: 20, gap: 8 }, cardTitle: { fontSize: 14, fontWeight: '700', color: theme.textMuted }, productName: { fontSize: 22, fontWeight: '800', color: theme.text }, price: { color: theme.pink, fontSize: 20, fontWeight: '800' }, productDesc: { fontSize: 14, color: theme.text, lineHeight: 22, marginTop: 6 }, detail: { fontSize: 13, color: theme.textMuted }, detailLabel: { fontWeight: '700', color: theme.text }, seller: { fontSize: 16, fontWeight: '700', color: theme.text },
  buyButton: { backgroundColor: theme.pink, borderRadius: 16, paddingVertical: 16, alignItems: 'center' }, buyButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' }, purchaseNotice: { backgroundColor: theme.card, borderRadius: 16, padding: 16 }, purchaseNoticeText: { color: theme.textMuted, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }, stateText: { color: theme.textMuted, fontSize: 14, textAlign: 'center' }, backLink: { color: theme.pink, fontWeight: '700' },
});
