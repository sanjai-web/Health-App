import React, { useState } from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeContext, ThemeMode } from './src/hooks/useTheme';
import { Colors, Gradients, Shadows } from './src/constants/theme';

export default function App() {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'));

  const themeValue = {
    mode,
    colors: mode === 'dark' ? Colors.dark : Colors.light,
    gradients: mode === 'dark' ? Gradients.dark : Gradients.light,
    shadows: mode === 'dark' ? Shadows.dark : Shadows.light,
    toggleTheme,
    isDark: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeContext.Provider>
  );
}
