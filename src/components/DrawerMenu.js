import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const ITEMS = [
  { label: 'Anunciar Produto', icon: 'megaphone-outline' },
  { label: 'Meu Perfil', icon: 'person-outline' },
  { label: 'Meus Pedidos', icon: 'bag-outline' },
  { label: 'Meus Favoritos', icon: 'heart-outline' },
  { label: 'Minhas Vendas', icon: 'storefront-outline', sellerOnly: true },
  { label: 'Carteira', icon: 'wallet-outline', sellerOnly: true },
  { label: 'Sobre Nós', icon: 'information-circle-outline' },
];

export default function DrawerMenu({ visible, onClose, isAdmin, hasAnnouncements, sellerLoading, onDonate, onProfile, onOrders, onFavorites, onSellerFeature, onAbout }) {
  const { theme, toggleTheme } = useTheme();
  const s = styles(theme);

  const handlePress = (label) => {
    onClose();
    if (label === 'Anunciar Produto') onDonate?.();
    else if (label === 'Meu Perfil') onProfile?.();
    else if (label === 'Meus Pedidos') onOrders?.();
    else if (label === 'Meus Favoritos') onFavorites?.();
    else if (label === 'Minhas Vendas' || label === 'Carteira') onSellerFeature?.(label);
    else if (label === 'Sobre Nós') onAbout?.();
  };

  const visibleItems = ITEMS.filter(item => !item.sellerOnly || (!sellerLoading && hasAnnouncements === true));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <Pressable onPress={onClose} style={s.backdrop} />
        <View style={s.panel}>
          {/* Header */}
          <View style={s.panelHeader}>
            <View style={s.logoRow}>
              <View style={s.logoCircle}>
                <Ionicons name="heart" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={s.logoText}>Além do Positivo</Text>
                <Text style={s.logoTagline}>Conectando famílias</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={({ pressed }) => [s.closeBtn, pressed && { opacity: 0.7 }]}>
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.itemsScroll}>
            {visibleItems.map((item, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [s.item, pressed && s.itemPressed]}
                onPress={() => handlePress(item.label)}
              >
                <View style={s.itemIconWrap}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={s.itemLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </Pressable>
            ))}

            {isAdmin && (
              <Pressable
                style={({ pressed }) => [s.item, pressed && s.itemPressed]}
                onPress={onClose}
              >
                <View style={[s.itemIconWrap, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Ionicons name="shield-outline" size={20} color="#ef4444" />
                </View>
                <Text style={[s.itemLabel, { color: '#ef4444' }]}>Administração</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </Pressable>
            )}
          </ScrollView>

          {/* Footer tema */}
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [s.themeToggle, pressed && { opacity: 0.7 }]}
          >
            <Ionicons
              name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={theme.textMuted}
            />
            <Text style={s.themeToggleText}>
              {theme.isDark ? 'Modo claro' : 'Modo escuro'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1, flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: { flex: 1 },
  panel: {
    width: '82%', maxWidth: 340,
    backgroundColor: theme.card,
    paddingTop: spacing.xl,
    ...shadows.strong,
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoCircle: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.primaryMedium,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    color: colors.primary,
    fontWeight: typography.extrabold,
    fontSize: typography.button,
    letterSpacing: -0.3,
  },
  logoTagline: { color: theme.textMuted, fontSize: 11 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.pinkSurface,
    alignItems: 'center', justifyContent: 'center',
  },
  itemsScroll: { flex: 1 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: 14,
    gap: spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  itemPressed: { backgroundColor: theme.pinkSurface },
  itemIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: theme.pinkLight,
    alignItems: 'center', justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: typography.button,
    fontWeight: typography.semibold,
    color: theme.text,
  },
  themeToggle: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderTopWidth: 1, borderTopColor: theme.border,
  },
  themeToggleText: {
    fontSize: typography.label,
    color: theme.textMuted,
    fontWeight: typography.medium,
  },
});
