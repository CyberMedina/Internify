import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'app_color_scheme';

export type ColorTokens = {
  primary: string;
  primary900: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  chipBg: string;
  success: string;
  error: string;
  skeletonBase: string;
  skeletonHighlight: string;
};

export const lightColors: ColorTokens = {
  primary: '#3B44F6', // Indigo/blue
  primary900: '#1F2BD1',
  surface: '#FFFFFF',
  card: '#F6F7FB',
  text: '#0F172A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  chipBg: '#EEF2FF',
  success: '#10B981',
  error: '#EF4444',
  skeletonBase: '#DFE2E8',       // gris suave, visible contra blanco
  skeletonHighlight: '#ECEEF3',  // highlight claro para pulso visible
};

export const darkColors: ColorTokens = {
  primary: '#4E6BFF',         // Azul brillante
  primary900: '#7C9BFF',      // Azul claro (hover/destacado)
  surface: '#1E1E1E',         // Gris oscuro medio (surface/cards/search)
  card: '#121212',            // Background base
  text: '#FFFFFF',            // Text primary
  textSecondary: '#B0B0B0',   // Text secondary
  border: '#2C2C2C',          // Divider/border
  chipBg: '#1E1E1E',          // Fondo de chip coherente con surface
  success: '#34D399',
  error: '#F87171',
  skeletonBase: '#2C2C2C',      // un poco más claro que card
  skeletonHighlight: '#3A3A3A', // highlight
};

export type Typography = {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
  sizes: {
    xs: number; sm: number; md: number; lg: number; xl: number; xxl: number;
  }
}

export const typography: Typography = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 }
}

export type Theme = {
  colors: ColorTokens;
  typography: Typography;
  radius: { sm: number; md: number; lg: number };
  spacing: (n: number) => number;
  isDark: boolean;
  scheme: 'light' | 'dark' | 'system';
  setScheme: (s: 'light' | 'dark' | 'system') => void;
  toggleScheme: () => void;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider: React.FC<{ scheme?: ColorSchemeName; children: React.ReactNode }> = ({ scheme, children }) => {
  const sys = useColorScheme();
  const [override, setOverride] = useState<'light' | 'dark' | 'system'>(
    (scheme as 'light' | 'dark' | 'system') || 'system'
  );
  const [loaded, setLoaded] = useState(false);

  // Cargar preferencia guardada (solo si existe)
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setOverride(saved);
      }
      // Si no hay valor guardado, se mantiene 'system' (sigue al SO)
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  // Persistir cuando cambia
  const setAndSaveScheme = (s: 'light' | 'dark' | 'system') => {
    setOverride(s);
    AsyncStorage.setItem(THEME_STORAGE_KEY, s).catch(() => {});
  };

  const effectiveScheme: 'light' | 'dark' = (override === 'system' ? (sys || 'light') : override) as 'light' | 'dark';
  const dark = effectiveScheme === 'dark';

  const value = useMemo<Theme>(() => ({
    colors: dark ? darkColors : lightColors,
    typography,
    radius: { sm: 8, md: 12, lg: 16 },
    spacing: (n) => n * 8,
    isDark: dark,
    scheme: override,
    setScheme: setAndSaveScheme,
    // Toggle basado en el tema efectivo actual (no el override)
    toggleScheme: () => setAndSaveScheme(dark ? 'light' : 'dark'),
  }), [dark, override]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
