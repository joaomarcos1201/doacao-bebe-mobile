import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SECTIONS = [
  {
    title: 'Nossa História',
    text: 'Fundada em 2024, a Além do Positivo nasceu da vontade de conectar famílias que têm itens de bebê em bom estado com famílias que precisam deles. Acreditamos que cada item doado carrega amor e transforma vidas.',
  },
  {
    title: 'Nosso Objetivo',
    text: 'Criar uma ponte solidária entre doadores e receptores, facilitando o acesso a itens essenciais para bebês de forma gratuita, segura e com respeito à dignidade de todas as famílias.',
  },
  {
    title: 'Nossa Visão',
    text: 'Ser a plataforma de referência em doações de itens infantis no Brasil, construindo uma comunidade solidária onde nenhuma família precise passar por dificuldades sozinha.',
  },
];

const HOW_STEPS = [
  { num: '1', title: 'Doar', desc: 'Cadastre itens que seu bebê não usa mais e ajude outra família.' },
  { num: '2', title: 'Buscar', desc: 'Encontre itens disponíveis perto de você de forma gratuita.' },
  { num: '3', title: 'Conectar', desc: 'Entre em contato com o doador e combine a retirada.' },
];

export default function AboutScreen({ onBack, onDonate, onViewProducts }) {
  const { theme, toggleTheme } = useTheme();
  const s = styles(theme);

  return (
    <View style={s.container}>
      {/* Navbar */}
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Sobre Nós</Text>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
          <Text style={s.themeBtn}>{theme.isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🌸</Text>
          </View>
          <Text style={s.heroTitle}>Além do Positivo</Text>
          <Text style={s.heroSubtitle}>Conectando famílias através da solidariedade</Text>
        </View>

        {/* Cards de texto */}
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.card}>
            <Text style={s.cardTitle}>{sec.title}</Text>
            <Text style={s.cardText}>{sec.text}</Text>
          </View>
        ))}

        {/* Card como funciona */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Como Funciona</Text>
          <View style={s.stepsGrid}>
            {HOW_STEPS.map((step) => (
              <View key={step.num} style={s.stepCard}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{step.num}</Text>
                </View>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botões */}
        <View style={s.buttons}>
          <TouchableOpacity style={s.btnPrimary} onPress={onDonate} activeOpacity={0.8}>
            <Text style={s.btnPrimaryText}>🎁  Fazer uma Doação</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnOutline} onPress={onViewProducts} activeOpacity={0.8}>
            <Text style={s.btnOutlineText}>Ver Produtos</Text>
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
  themeBtn: { fontSize: 20 },

  scroll: { padding: 16, gap: 16, alignItems: 'center' },

  // Hero
  hero: { alignItems: 'center', paddingVertical: 16, gap: 8, width: '100%' },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: theme.pink,
    backgroundColor: 'rgba(232,96,122,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: theme.pink, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, color: theme.textMuted, textAlign: 'center', lineHeight: 20 },

  // Cards
  card: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 760,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.pink },
  cardText: { fontSize: 14, color: theme.textMuted, lineHeight: 22 },

  // Steps grid
  stepsGrid: { flexDirection: 'row', gap: 10 },
  stepCard: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(232,96,122,0.04)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  stepNum: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: theme.pink, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: theme.text },
  stepDesc: { fontSize: 11, color: theme.textMuted, textAlign: 'center', lineHeight: 16 },

  // Botões
  buttons: { width: '100%', maxWidth: 760, gap: 12, paddingBottom: 8 },
  btnPrimary: {
    backgroundColor: '#c0606a', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
    shadowColor: '#c0606a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnOutline: {
    borderWidth: 2, borderColor: theme.pink,
    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'transparent',
  },
  btnOutlineText: { color: theme.pink, fontWeight: '600', fontSize: 15 },
});
