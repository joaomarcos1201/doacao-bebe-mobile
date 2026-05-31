import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEMS = [
  { label: 'Doar Produto' },
  { label: 'Meu Perfil' },
  { label: 'Sobre Nós' },
];

export default function DrawerMenu({ visible, onClose, isAdmin, onDonate, onProfile, onAbout }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
          <Text style={s.closeBtnText}>✕ Fechar</Text>
        </TouchableOpacity>
        <Text style={s.drawerTitle}>Menu</Text>
        {ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={s.item}
            onPress={
              item.label === 'Doar Produto' ? () => { onClose(); onDonate?.(); } :
              item.label === 'Meu Perfil' ? () => { onClose(); onProfile?.(); } :
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
    </Modal>
  );
}

const styles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  closeBtnText: { color: theme.textMuted, fontSize: 15, fontWeight: '600' },
  drawerTitle: { color: theme.pink, fontSize: 22, fontWeight: '800', marginBottom: 24 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 18, borderBottomWidth: 1,
    borderBottomColor: theme.border, gap: 16,
  },
  itemIcon: { fontSize: 24 },
  itemLabel: { fontSize: 17, fontWeight: '500', color: theme.text },
});
