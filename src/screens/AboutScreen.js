import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const SECTIONS = [
  {
    title: 'Nossa História',
    icon: 'heart-outline',
    text: 'Fundada em 2024, a Além do Positivo nasceu da vontade de conectar famílias que têm itens de bebê em bom estado com famílias que precisam deles. Acreditamos que cada item doado carrega amor e transforma vidas.',
  },
  {
    title: 'Nosso Objetivo',
    icon: 'flag-outline',
    text: 'Criar uma ponte solidária entre doadores e receptores, facilitando o acesso a itens essenciais para bebês de forma gratuita, segura e com respeito à dignidade de todas as famílias.',
  },
  {
    title: 'Nossa Visão',
    icon: 'eye-outline',
    text: 'Ser a plataforma de referência em doações de itens infantis no Brasil, construindo uma comunidade solidária onde nenhuma família precise passar por dificuldades sozinha.',
  },
];

const HOW_STEPS = [
  { num: '1', icon: 'gift-outline', title: 'Doar', desc: 'Cadastre itens que seu bebê não usa mais e ajude outra família.' },
  { num: '2', icon: 'search-outline', title: 'Buscar', desc: 'Encontre itens disponíveis perto de você de forma gratuita.' },
  { num: '3', icon: 'people-outline', title: 'Conectar', desc: 'Entre em contato com o doador e combine a retirada.' },
];

export default function AboutScreen({ onBack, onDonate, onViewProducts }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <View style={s.container}>
      <ScreenHeader title="Sobre Nós" onBack={onBack} backLabel="Voltar" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroDecor} />
          <View style={s.logoCircle}>
            <Ionicons name="heart" size={36} color={colors.primary} />
          </View>
          <Text style={s.heroTitle}>Além do Positivo</Text>
          <Text style={s.heroSubtitle}>Conectando famílias através da solidariedade</Text>
        </View>

        {/* Seções */}
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.card}>
            <View style={s.cardTitleRow}>
              <View style={s.cardIconWrap}>
                <Ionicons name={sec.icon} size={18} color={colors.primary} />
              </View>
              <Text style={s.cardTitle}>{sec.title}</Text>
            </View>
            <Text style={s.cardText}>{sec.text}</Text>
          </View>
        ))}

        {/* Como funciona */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Como Funciona</Text>
          <View style={s.stepsRow}>
            {HOW_STEPS.map((step) => (
              <View key={step.num} style={s.stepCard}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{step.num}</Text>
                </View>
                <Ionicons name={step.icon} size={22} color={colors.primary} />
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botões */}
        <Pressable
          style={({ pressed }) => [s.btnPrimary, pressed && { opacity: 0.85 }]}
          onPress={onDonate}
        >
          <Ionicons name="gift-outline" size={18} color="#fff" />
          <Text style={s.btnPrimaryText}>Fazer uma Doação</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [s.btnOutline, pressed && { opacity: 0.8 }]}
          onPress={onViewProducts}
        >
          <Ionicons name="grid-outline" size={18} color={colors.primary} />
          <Text style={s.btnOutlineText}>Ver Produtos</Text>
        </Pressable>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  hero: {
    alignItems: 'center', paddingVertical: spacing.xxl,
    gap: spacing.sm, position: 'relative', overflow: 'hidden',
    backgroundColor: theme.isDark ? '#1a0a0c' : '#fff7f9',
    borderRadius: radius.xl, borderWidth: 1, borderColor: theme.cardBorder,
  },
  heroDecor: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(192,96,106,0.07)', top: -60, right: -60,
  },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2.5, borderColor: colors.primaryMedium,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: {
    fontSize: typography.pageTitle, fontWeight: typography.extrabold,
    color: colors.primary, letterSpacing: -0.5, textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: typography.body, color: theme.textMuted,
    textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.xl,
  },

  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.md,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: colors.primary },
  cardText: { fontSize: typography.body, color: theme.textMuted, lineHeight: 22 },

  sectionTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: theme.textTitle, letterSpacing: -0.2 },
  stepsRow: { flexDirection: 'row', gap: spacing.sm },
  stepCard: {
    flex: 1, alignItems: 'center', gap: spacing.xs,
    backgroundColor: theme.pinkSurface,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.support },
  stepTitle: { fontSize: typography.label, fontWeight: typography.bold, color: theme.text },
  stepDesc: { fontSize: 11, color: theme.textMuted, textAlign: 'center', lineHeight: 16 },

  btnPrimary: {
    backgroundColor: colors.primary, paddingVertical: 15,
    borderRadius: radius.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    ...shadows.cta,
  },
  btnPrimaryText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.button },
  btnOutline: {
    borderWidth: 2, borderColor: colors.primary,
    paddingVertical: 15, borderRadius: radius.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  btnOutlineText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.button },
});
