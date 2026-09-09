import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

const colorFor = (status) => {
  const value = String(status || '').toUpperCase();
  if (['APROVADO', 'FINALIZADO', 'LIBERADO', 'ENTREGUE'].includes(value)) return colors.successAlt;
  if (['PENDENTE', 'RETIDO', 'AGUARDANDO_POSTAGEM'].includes(value)) return colors.warning;
  if (['CANCELADO', 'REJEITADO', 'REPROVADO', 'ESTORNADO'].includes(value)) return colors.error;
  if (['POSTADO', 'EM_TRANSITO'].includes(value)) return colors.transport;
  if (value === 'SAIU_ENTREGA') return colors.purple;
  return colors.textSecondary;
};

export default function StatusBadge({ status, label }) {
  const color = colorFor(status);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}18` }]}>
      <Text style={[styles.text, { color }]}>{label || status || 'Não informado'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  text: {
    fontSize: typography.meta,
    fontWeight: typography.extrabold,
    letterSpacing: 0.2,
  },
});
