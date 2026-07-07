import { createContext, useContext } from 'react';
import { Colors, Gradients, Shadows } from '../constants/theme';

export type ThemeMode = 'dark' | 'light';

export interface ThemeContextValue {
  mode: ThemeMode;
  colors: typeof Colors.dark;
  gradients: typeof Gradients.dark;
  shadows: typeof Shadows.dark;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  colors: Colors.dark,
  gradients: Gradients.dark,
  shadows: Shadows.dark,
  toggleTheme: () => {},
  isDark: true,
});

export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};
