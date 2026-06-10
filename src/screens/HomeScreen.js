import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CARDS = [
  {
    key: 'chat',
    title: 'Chat',
    description: 'Converse com doadores e receptores diretamente pelo app.',
    icon: '💬',
  },
  {
    key: 'donation',
    title: 'Anunciar',
    description: 'Doe itens que seu bebê não usa mais para famílias que precisam.',
    icon: '🎁',
  },
  {
    key: 'profile',
    title: 'Meu Perfil',
    description: 'Gerencie seus dados, senha e seus anúncios publicados.',
    icon: '👤',
  },
  {
    key: 'about',
    title: 'Sobre Nós',
    description: 'Conheça a história e os valores do Além do Positivo.',
    icon: 'ℹ️',
  },
];

export default function HomeScreen({ onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const s = styles(theme);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Botão tema */}
      <TouchableOpacity onPress={toggleTheme} style={s.themeBtn} activeOpacity={0.7}>
        <Text style={s.themeBtnText}>{theme.isDark ? ' Modo Claro' : ' Modo Escuro'}</Text>
      </TouchableOpacity>
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroCircle1} />
        <View style={s.heroCircle2} />
        <View style={s.logoCircle}>
          <Image source={require('../../assets/logo.jpeg')} style={s.logoImage} />
        </View>
        <Text style={s.heroTitle}>Além do Positivo</Text>
        <Text style={s.heroSubtitle}>
          Conectando quem faz com quem precisa
        </Text>
      </View>

      {/* Cards */}
      <View style={s.cardsGrid}>
        {CARDS.map((card) => (
          <TouchableOpacity
            key={card.key}
            style={s.card}
            onPress={() => onNavigate?.(card.key)}
            activeOpacity={0.8}
          >
            <Text style={s.cardIcon}>{card.icon}</Text>
            <Text style={s.cardTitle}>{card.title}</Text>
            <Text style={s.cardDesc}>{card.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  themeBtn: { alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: theme.pinkLight, borderWidth: 1, borderColor: theme.border },
  themeBtnText: { color: theme.pink, fontSize: 13, fontWeight: '600' },
  scroll: { padding: 16, gap: 20 },

  hero: {
    alignItems: 'center', paddingVertical: 32,
    backgroundColor: theme.bgSecondary,
    borderRadius: 24, overflow: 'hidden',
    position: 'relative', gap: 8,
  },
  heroCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(232,96,122,0.08)', top: -60, right: -60,
  },
  heroCircle2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(232,96,122,0.06)', bottom: -40, left: -40,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: '#e8a0a8',
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: theme.pink },
  heroSubtitle: { fontSize: 13, color: theme.textMuted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

  // Grid 2 colunas
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: theme.card,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardIcon: { fontSize: 36 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.text, textAlign: 'center' },
  cardDesc: { fontSize: 12, color: theme.textMuted, textAlign: 'center', lineHeight: 18 },
});
