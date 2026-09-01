import React, { createContext, useContext, useState } from 'react';
import { colors, darkColors } from '../theme/tokens';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(p => !p);

  const theme = {
    isDark,
    bg: isDark ? darkColors.card : colors.card,
    bgSecondary: isDark ? darkColors.pinkLight : colors.backgroundAlt,
    card: isDark ? darkColors.card : colors.card,
    text: isDark ? darkColors.text : colors.text,
    textMuted: isDark ? darkColors.textSecondary : colors.textSecondary,
    border: isDark ? darkColors.border : colors.border,
    pink: colors.primary,
    pinkLight: isDark ? darkColors.pinkLight : colors.pinkLight,
    input: isDark ? darkColors.input : colors.card,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
