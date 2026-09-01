import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_KEY = 'alem-do-positivo.auth-token';

export const authStorage = {
  getToken: () => SecureStore.getItemAsync(AUTH_TOKEN_KEY),
  saveToken: (token) => SecureStore.setItemAsync(AUTH_TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
};
