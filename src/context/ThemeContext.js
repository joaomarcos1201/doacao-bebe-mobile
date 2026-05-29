import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(p => !p);

  const theme = {
    isDark,
    bg: isDark ? '#1a1a2e' : '#fff',
    bgSecondary: isDark ? '#16213e' : '#fdf2f4',
    card: isDark ? '#0f3460' : '#fff',
    text: isDark ? '#f0f0f0' : '#333',
    textMuted: isDark ? '#aaa' : '#666',
    border: isDark ? '#333' : '#f0d0d5',
    pink: '#e8607a',
    pinkLight: isDark ? 'rgba(232,96,122,0.2)' : 'rgba(232,96,122,0.1)',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
