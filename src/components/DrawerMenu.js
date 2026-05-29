import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ITEMS = [
  { label: 'Doar Produto', icon: '📦' },
  { label: 'Meu Perfil', icon: '👤' },
  { label: 'Sobre Nós', icon: 'ℹ️' },
  { label: 'Fale Conosco', icon: '💬' },
  { label: 'FAQ', icon: '❓' },
];

export default function DrawerMenu({ visible, onClose, isAdmin, onDonate, onProfile, onAbout }) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-260)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -260,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const s = styles(theme);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={s.overlay} onPress={onClose}>
        <Animated.View
          style={[s.drawer, { transform: [{ translateX: slideAnim }] }]}
        >
          <Pressable>
            <Text style={s.drawerTitle}>Menu</Text>
            {ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={s.item} onPress={
                item.label === 'Doar Produto' ? () => { onClose(); onDonate?.(); } :
                item.label === 'Meu Perfil' ? () => { onClose(); onProfile?.(); } :
                item.label === 'Sobre Nós' ? () => { onClose(); onAbout?.(); } :
                onClose
              }>
                <Text style={s.itemIcon}>{item.icon}</Text>
                <Text style={[s.itemLabel, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            {isAdmin && (
              <TouchableOpacity style={s.item} onPress={onClose}>
                <Text style={s.itemIcon}>⚙️</Text>
                <Text style={[s.itemLabel, { color: theme.pink }]}>Administração</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = (theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', flexDirection: 'row', justifyContent: 'flex-start' },
  drawer: { width: 260, backgroundColor: theme.card, paddingTop: 60, paddingHorizontal: 20 },
  drawerTitle: { color: theme.pink, fontSize: 18, fontWeight: '700', marginBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12 },
  itemIcon: { fontSize: 20 },
  itemLabel: { fontSize: 15, fontWeight: '500' },
});
