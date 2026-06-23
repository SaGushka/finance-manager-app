import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme, Platform } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "dark";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    // Применить тему для NativeWind
    nativewindColorScheme.set(scheme);
    
    // Применить для системы
    if (Appearance.setColorScheme) {
      Appearance.setColorScheme(scheme);
    }
    
    // Применить для веб-версии
    if (typeof document !== "undefined" && typeof window !== "undefined") {
      try {
        const root = document.documentElement;
        root.dataset.theme = scheme;
        root.classList.remove("light", "dark");
        root.classList.add(scheme);
        
        const palette = SchemeColors[scheme];
        Object.entries(palette).forEach(([token, value]) => {
          root.style.setProperty(`--color-${token}`, value);
        });
      } catch (e) {
        console.warn("Failed to apply theme to document", e);
      }
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyScheme(scheme);
  }, [applyScheme]);

  // Инициализировать тему при монтировании
  useEffect(() => {
    applyScheme(colorScheme);
  }, [colorScheme, applyScheme]);
  
  // Слушать изменения системной темы
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (newScheme) {
        setColorSchemeState(newScheme as ColorScheme);
      }
    });
    return () => subscription.remove();
  }, []);

  // Создать переменные темы для NativeWind
  const themeVariables = useMemo(
    () => {
      const palette = SchemeColors[colorScheme];
      return vars({
        "color-primary": palette.primary,
        "color-background": palette.background,
        "color-surface": palette.surface,
        "color-foreground": palette.foreground,
        "color-muted": palette.muted,
        "color-border": palette.border,
        "color-success": palette.success,
        "color-warning": palette.warning,
        "color-error": palette.error,
      });
    },
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
    }),
    [colorScheme, setColorScheme],
  );
  
  // Отладочная информация
  if (Platform.OS === "ios" && process.env.NODE_ENV === "development") {
    // console.log("[ThemeProvider] iOS theme applied:", colorScheme);
  }
  // Debug logging
  if (process.env.NODE_ENV === "development") {
    // console.log("Theme applied:", { colorScheme, themeVariables });
  }

  return (
    <ThemeContext.Provider value={value}>
      <View 
        style={[{ flex: 1 }, themeVariables]}
        // Ensure theme is applied on native platforms
        nativeID="theme-provider-root"
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
