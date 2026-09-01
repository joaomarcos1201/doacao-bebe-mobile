import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, getApiErrorMessage, productApi, setUnauthorizedHandler } from '../services/api';
import { authStorage } from '../services/authStorage';

const AuthContext = createContext(null);

const mapUser = (data) => ({
  id: data.id,
  name: data.nome,
  nome: data.nome,
  email: data.email,
  isAdmin: Boolean(data.isAdmin),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAnnouncements, setHasAnnouncements] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const logout = useCallback(async () => {
    await authStorage.removeToken();
    setToken(null);
    setUser(null);
    setHasAnnouncements(null);
  }, []);

  const refreshSellerStatus = useCallback(async () => {
    setSellerLoading(true);
    try {
      const response = await productApi.sellerSummary();
      const summary = response.data || {};
      const hasAds = Boolean(summary.jaAnunciou || Number(summary.totalAnuncios) > 0);
      setHasAnnouncements(hasAds);
      return hasAds;
    } catch {
      setHasAnnouncements(null);
      return false;
    } finally { setSellerLoading(false); }
  }, [user]);

  const refreshUser = useCallback(async () => {
    const response = await authApi.me();
    const nextUser = mapUser(response.data);
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const savedToken = await authStorage.getToken();
        if (!savedToken) return;

        if (mounted) setToken(savedToken);
        const response = await authApi.me();
        if (mounted) setUser(mapUser(response.data));
        if (mounted) {
          try {
            const summary = await productApi.sellerSummary();
            const data = summary.data || {};
            setHasAnnouncements(Boolean(data.jaAnunciou || Number(data.totalAnuncios) > 0));
          } catch { setHasAnnouncements(null); }
        }
      } catch {
        await authStorage.removeToken();
        if (mounted) {
          setToken(null);
          setUser(null);
          setHasAnnouncements(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email, senha) => {
    try {
      const response = await authApi.login(email.trim().toLowerCase(), senha);
      const nextToken = response.data?.token;
      if (!nextToken) throw new Error('Resposta de login inválida.');
      await authStorage.saveToken(nextToken);
      setToken(nextToken);
      const nextUser = await refreshUser();
      await refreshSellerStatus();
      return nextUser;
    } catch (error) {
      await authStorage.removeToken();
      setToken(null);
      setUser(null);
      throw new Error(getApiErrorMessage(error, 'Email ou senha inválidos.'));
    }
  }, [refreshSellerStatus, refreshUser]);

  const register = useCallback(async (nome, email, cpf, senha) => {
    try {
      const response = await authApi.register(nome.trim(), email.trim().toLowerCase(), cpf.replace(/\D/g, ''), senha);
      const nextToken = response.data?.token;
      if (!nextToken) throw new Error('Resposta de cadastro inválida.');
      await authStorage.saveToken(nextToken);
      setToken(nextToken);
      const nextUser = await refreshUser();
      setUser(nextUser);
      await refreshSellerStatus();
      return nextUser;
    } catch (error) {
      await authStorage.removeToken();
      setToken(null);
      setUser(null);
      throw new Error(getApiErrorMessage(error, 'Não foi possível criar sua conta.'));
    }
  }, [refreshSellerStatus, refreshUser]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
      hasAnnouncements,
      sellerLoading,
      refreshSellerStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
