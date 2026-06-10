import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProductDetailScreen({ onBack, product }) {
  const { theme, toggleTheme } = useTheme();
  const s = styles(theme);

  if (!product) return null;

  return (
    <View style={s.container}>
      {/* Navbar */}
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Detalhes do Produto</Text>
        <TouchableOpacity onPress={toggleTheme} style={s.themeBtn} activeOpacity={0.7}>
          <Text style={s.themeBtnText}>{theme.isDark ? '☀️ Claro' : '🌙 Escuro'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Imagem */}
        <View style={s.imageBox}>
          <Text style={s.imageEmoji}>🎁</Text>
        </View>

        {/* Badges */}
        <View style={s.badges}>
          <View style={s.badgeCategory}>
            <Text style={s.badgeCategoryText}>{product.category}</Text>
          </View>
          <View style={[s.badgeStatus, product.status === 'Ativo' ? s.badgeActive : s.badgeClosed]}>
            <Text style={[s.badgeStatusText, { color: product.status === 'Ativo' ? '#3aaa6e' : '#999' }]}>
              {product.status === 'Ativo' ? '● Ativo' : '● Encerrado'}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={s.card}>
          <Text style={s.productName}>{product.name}</Text>
          <Text style={s.productCondition}>Condição: {product.condition}</Text>
          {product.desc ? (
            <Text style={s.productDesc}>{product.desc}</Text>
          ) : null}
        </View>

        {/* Ações */}
        <View style={s.actions}>
          <TouchableOpacity style={s.btnDanger} activeOpacity={0.8}>
            <Text style={s.btnDangerText}>Encerrar Anúncio</Text>
          </TouchableOpacity>
        </View>
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
  backBtn: { color: theme.pink, fontSize: 15, fontWeight: '600' },
  navTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  themeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.pinkLight, borderWidth: 1, borderColor: theme.border },
  themeBtnText: { color: theme.pink, fontSize: 12, fontWeight: '600' },

  scroll: { padding: 16, gap: 16 },

  imageBox: {
    height: 220, borderRadius: 20,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  imageEmoji: { fontSize: 80 },

  badges: { flexDirection: 'row', gap: 8 },
  badgeCategory: {
    backgroundColor: 'rgba(232,96,122,0.15)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  badgeCategoryText: { color: theme.pink, fontSize: 12, fontWeight: '600' },
  badgeStatus: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeActive: { backgroundColor: 'rgba(58,170,110,0.12)' },
  badgeClosed: { backgroundColor: 'rgba(150,150,150,0.12)' },
  badgeStatusText: { fontSize: 12, fontWeight: '600' },

  card: {
    backgroundColor: theme.card, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    gap: 8,
  },
  productName: { fontSize: 20, fontWeight: '800', color: theme.text },
  productCondition: { fontSize: 13, color: theme.textMuted },
  productDesc: { fontSize: 14, color: theme.text, lineHeight: 22, marginTop: 4 },

  actions: { gap: 12 },
  btnDanger: {
    borderWidth: 1.5, borderColor: '#e05555',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  btnDangerText: { color: '#e05555', fontWeight: '700', fontSize: 15 },
});
