// ============================================================
// DESIGN SYSTEM — ALÉM DO POSITIVO
// Fonte única de verdade para cores, tipografia, espaçamento,
// bordas, sombras e gradientes do aplicativo.
// ============================================================

// --- CORES PRINCIPAIS ---
export const colors = {
  // Primary
  primary: '#c0606a',
  primaryMedium: '#E88AA2',
  primaryHover: '#d4708a',
  primaryLight: '#F48FB1',

  // Fundos
  background: '#f9f5f6',
  backgroundAlt: '#F8F9FA',
  backgroundHome: '#fff7f9',
  surface: '#ffffff',

  // Cards
  cardBorder: '#f0e6e8',
  cardBorderProduct: 'rgba(248,215,227,0.6)',

  // Texto
  textPrimary: '#1a1a2e',
  textBody: '#374151',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textPlaceholder: '#999999',

  // Estados
  success: '#22c55e',
  successAlt: '#16A34A',
  successBg: '#d4edda',
  successBorder: '#c3e6cb',
  successText: '#155724',

  error: '#ef4444',
  errorAlt: '#DC2626',
  errorBg: '#f8d7da',
  errorBorder: '#f5c6cb',
  errorText: '#721c24',

  warning: '#D97706',
  warningBg: '#fff3cd',
  warningBorder: '#ffeaa7',
  warningText: '#856404',

  info: '#2196f3',
  infoBg: '#d1ecf1',
  infoBorder: '#bee5eb',
  infoText: '#0c5460',

  // Outros
  transport: '#eab308',
  purple: '#9c27b0',
  whatsapp: '#25D366',

  // Favorito
  heartInactive: '#f0c0c8',
  heartActive: '#c0606a',
};

// --- CORES TEMA ESCURO ---
export const darkColors = {
  background: '#0f0f0f',
  backgroundAlt: '#0f1419',
  surface: '#141414',
  surfaceSoft: '#1a1a1a',
  input: '#1e1e1e',
  border: '#2a2a2a',
  borderInput: '#333333',
  textPrimary: '#f5e0e2',
  textBody: '#e0e0e0',
  textSecondary: '#888888',
  textTertiary: '#666666',
  pinkSurface: '#2a1a1c',
  primary: '#f0c0c8',
};

// --- ESPAÇAMENTO ---
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// --- BORDER RADIUS ---
export const radius = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

// --- TIPOGRAFIA ---
export const typography = {
  // Tamanhos
  meta: 11,
  support: 12,
  label: 13,
  body: 14,
  button: 15,
  navTitle: 16,
  cardTitle: 18,
  cardPrice: 20,
  authTitle: 22,
  code: 24,
  successTitle: 26,
  pageTitle: 28,
  priceMain: 32,
  heroTitle: 36,

  // Pesos
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

// --- SOMBRAS ---
export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 6,
  },
  pink: {
    shadowColor: '#E88AA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 5,
  },
  cta: {
    shadowColor: '#c0606a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
};

// --- ÍCONES ---
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 22,
  xl: 26,
  xxl: 32,
  hero: 52,
};
