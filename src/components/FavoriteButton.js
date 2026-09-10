import React, { useRef } from 'react';
import { Alert, Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../theme/tokens';

export default function FavoriteButton({ productId, style, onChanged }) {
  const { user } = useAuth();
  const { isFavorite, loadingIds, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);
  const loading = loadingIds.has(productId);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    try {
      const nextValue = await toggleFavorite(productId);
      // toggleFavorite returns false when not authenticated (modal handled by context)
      if (nextValue !== false || user) onChanged?.(nextValue);
    } catch {
      Alert.alert('Favoritos', 'Não foi possível atualizar este favorito. Tente novamente.');
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, style, pressed && { opacity: 0.8 }, loading && styles.loading]}
      onPress={handlePress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={active ? 'heart' : 'heart-outline'}
          size={18}
          color={active ? colors.heartActive : colors.heartInactive}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...shadows.light,
  },
  loading: { opacity: 0.5 },
});
