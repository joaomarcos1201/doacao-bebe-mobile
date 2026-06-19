import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'AUTH_TOKEN';

export async function salvarToken(token) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return true;
  } catch (e) {
    console.log('[AUTH] salvarToken error', e?.message ?? e);
    return false;
  }
}

export async function buscarToken() {
  try {
    const t = await SecureStore.getItemAsync(TOKEN_KEY);
    return t;
  } catch (e) {
    console.log('[AUTH] buscarToken error', e?.message ?? e);
    return null;
  }
}

export async function removerToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return true;
  } catch (e) {
    console.log('[AUTH] removerToken error', e?.message ?? e);
    return false;
  }
}

const USER_KEY = 'AUTH_USER';

export async function salvarUsuario(user) {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return true;
  } catch (e) {
    console.log('[AUTH] salvarUsuario error', e?.message ?? e);
    return false;
  }
}

export async function buscarUsuario() {
  try {
    const s = await SecureStore.getItemAsync(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.log('[AUTH] buscarUsuario error', e?.message ?? e);
    return null;
  }
}

export async function removerUsuario() {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
    return true;
  } catch (e) {
    console.log('[AUTH] removerUsuario error', e?.message ?? e);
    return false;
  }
}
