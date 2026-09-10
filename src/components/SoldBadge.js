import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, typography } from '../theme/tokens';

/**
 * SoldBadge — exibe o selo "VENDIDO" sobre a imagem do produto.
 * variant="overlay": cobre a imagem com overlay semitransparente + texto centralizado (cards)
 * variant="banner": faixa horizontal discreta (tela de detalhe)
 */
export default function SoldBadge({ variant = 'overlay' }) {
  if (variant === 'banner') {
    return (
      <View style={styles.banner}>
        <View style={styles.bannerDot} />
        <Text style={styles.bannerText}>Este produto foi vendido</Text>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.pill}>
        <Text style={styles.pillText}>VENDIDO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlay sobre imagem do card
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  pill: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: typography.extrabold,
    letterSpacing: 1.5,
  },

  // Banner horizontal na tela de detalhe
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  bannerText: {
    color: '#ffffff',
    fontSize: typography.label,
    fontWeight: typography.semibold,
    letterSpacing: 0.2,
  },
});
