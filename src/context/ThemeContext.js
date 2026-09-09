import React, { createContext, useContext, useState } from 'react';
import { colors, darkColors } from '../theme/tokens';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(p => !p);

  const theme = {
    isDark,

    // Fundos
    bg: isDark ? darkColors.background : colors.background,
    bgAlt: isDark ? darkColors.backgroundAlt : colors.backgroundAlt,
    bgHome: isDark ? darkColors.background : colors.backgroundHome,
    surface: isDark ? darkColors.surface : colors.surface,
    surfaceSoft: isDark ? darkColors.surfaceSoft : '#fdf8f9',

    // Cards
    card: isDark ? darkColors.surface : colors.surface,
    cardBorder: isDark ? darkColors.border : colors.cardBorder,

    // Inputs
    input: isDark ? darkColors.input : '#fdf0f2',
    inputBorder: isDark ? darkColors.borderInput : '#e8d0d4',

    // Texto
    text: isDark ? darkColors.textBody : colors.textBody,
    textTitle: isDark ? darkColors.textPrimary : colors.textPrimary,
    textMuted: isDark ? darkColors.textSecondary : colors.textSecondary,
    textTertiary: isDark ? darkColors.textTertiary : colors.textTertiary,

    // Bordas
    border: isDark ? darkColors.border : colors.cardBorder,

    // Marca
    pink: isDark ? darkColors.primary : colors.primary,
    pinkMedium: colors.primaryMedium,
    pinkLight: isDark ? darkColors.pinkSurface : '#FFF0F2',
    pinkSurface: isDark ? 'rgba(192,96,106,0.12)' : 'rgba(192,96,106,0.08)',

    // Estados
    success: colors.success,
    successAlt: colors.successAlt,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
