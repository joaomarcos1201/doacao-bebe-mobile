import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEMS = [
  { label: 'Doar Produto' },
  { label: 'Meu Perfil' },
  { label: 'Meus Pedidos' },
  { label: 'Meus Favoritos' },
  { label: 'Minhas Vendas', sellerOnly: true },
  { label: 'Carteira', sellerOnly: true },
  { label: 'Sobre Nós' },
];

export default function DrawerMenu({ visible, onClose, isAdmin, hasAnnouncements, sellerLoading, onDonate, onProfile, onOrders, onFavorites, onSellerFeature, onAbout }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <TouchableOpacity onPress={onClose} style={s.backdrop} activeOpacity={1} />
        <View style={s.panel}>
        <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
          <Text style={s.closeBtnText}>✕ Fechar</Text>
        </TouchableOpacity>
        <Text style={s.drawerTitle}>Menu</Text>
        {ITEMS.filter((item) => !item.sellerOnly || (!sellerLoading && hasAnnouncements === true)).map((item, i) => (
          <TouchableOpacity
            key={i}
            style={s.item}
            onPress={
              item.label === 'Doar Produto' ? () => { onClose(); onDonate?.(); } :
              item.label === 'Meu Perfil' ? () => { onClose(); onProfile?.(); } :
              item.label === 'Meus Pedidos' ? () => { onClose(); onOrders?.(); } :
              item.label === 'Meus Favoritos' ? () => { onClose(); onFavorites?.(); } :
              item.sellerOnly ? () => { onClose(); onSellerFeature?.(item.label); } :
              item.label === 'Sobre Nós' ? () => { onClose(); onAbout?.(); } :
              onClose
            }
          >
            <Text style={s.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        {isAdmin && (
          <TouchableOpacity style={s.item} onPress={onClose}>
            <Text style={[s.itemLabel, { color: theme.pink }]}>Administração</Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    </Modal>
  );
}

const styles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  backdrop: { flex: 1 },
  panel: { width: '84%', maxWidth: 360, backgroundColor: theme.isDark ? '#141414' : '#fff', paddingTop: 52, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 8 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  closeBtnText: { color: theme.textMuted, fontSize: 15, fontWeight: '600' },
  drawerTitle: { color: theme.pink, fontSize: 22, fontWeight: '800', marginBottom: 24 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: theme.border, gap: 16,
  },
  itemIcon: { fontSize: 24 },
  itemLabel: { fontSize: 17, fontWeight: '500', color: theme.text },
});
