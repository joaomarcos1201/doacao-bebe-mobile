import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoriteButton({ productId, style, onChanged }) {
  const { isFavorite, loadingIds, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);
  const loading = loadingIds.has(productId);
  const handlePress = async () => {
    try { const nextValue = await toggleFavorite(productId); onChanged?.(nextValue); } catch { Alert.alert('Favoritos', 'Não foi possível atualizar este favorito. Tente novamente.'); }
  };
  return <TouchableOpacity style={[styles.button, style, loading && styles.loading]} onPress={handlePress} disabled={loading} accessibilityRole="button" accessibilityLabel={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}><Text style={[styles.icon, active && styles.active]}>{active ? '♥' : '♡'}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  button: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  icon: { color: '#c0606a', fontSize: 25, lineHeight: 28 }, active: { color: '#c0606a' }, loading: { opacity: 0.5 },
});
