import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { favoriteApi } from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loadingIds, setLoadingIds] = useState(new Set());

  const loadFavoriteIds = useCallback(async () => {
    if (!user) { setFavoriteIds(new Set()); return; }
    try {
      const response = await favoriteApi.ids();
      setFavoriteIds(new Set(Array.isArray(response.data) ? response.data : []));
    } catch { /* Preserve the last known state when the API is temporarily unavailable. */ }
  }, [user]);

  useEffect(() => { loadFavoriteIds(); }, [loadFavoriteIds]);

  const toggleFavorite = useCallback(async (productId) => {
    if (!user || loadingIds.has(productId)) return false;
    const isFavorite = favoriteIds.has(productId);
    setLoadingIds((current) => new Set(current).add(productId));
    try {
      if (isFavorite) await favoriteApi.remove(productId); else await favoriteApi.add(productId);
      setFavoriteIds((current) => { const next = new Set(current); if (isFavorite) next.delete(productId); else next.add(productId); return next; });
      return !isFavorite;
    } finally {
      setLoadingIds((current) => { const next = new Set(current); next.delete(productId); return next; });
    }
  }, [favoriteIds, loadingIds, user]);

  return <FavoritesContext.Provider value={{ favoriteIds, loadingIds, isFavorite: (id) => favoriteIds.has(id), toggleFavorite, loadFavoriteIds }}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
