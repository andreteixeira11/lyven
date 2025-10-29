import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  success: string;
  error: string;
  warning: string;
  white: string;
  black: string;
}

const lightColors: ThemeColors = {
  primary: '#0099a8',
  background: '#FFFFFF',
  card: '#F0F9FA',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  notification: '#FF385C',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  white: '#FFFFFF',
  black: '#000000',
};

const darkColors: ThemeColors = {
  primary: '#00C4D8',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#2C2C2C',
  notification: '#FF6B85',
  success: '#66BB6A',
  error: '#EF5350',
  warning: '#FFA726',
  white: '#FFFFFF',
  black: '#000000',
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [theme, setTheme] = useState<Theme>('system');
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadTheme();
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const changeTheme = useCallback(async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const getActiveColorScheme = useCallback((): 'light' | 'dark' => {
    if (theme === 'system') {
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme as 'light' | 'dark';
  }, [theme, colorScheme]);

  const isDark = getActiveColorScheme() === 'dark';
  const colors: ThemeColors = isDark ? darkColors : lightColors;

  return useMemo(() => ({
    theme,
    colors,
    isDark,
    changeTheme,
    activeColorScheme: getActiveColorScheme(),
  }), [theme, colors, isDark, changeTheme, getActiveColorScheme]);
});
