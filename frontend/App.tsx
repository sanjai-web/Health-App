import React, { useState } from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeContext, ThemeMode } from './src/hooks/useTheme';
import { Colors, Gradients, Shadows } from './src/constants/theme';

import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCBLdEB43paTY-KoElImBaX5NSK9Qlef_U",
  authDomain: "in-1-health-check.firebaseapp.com",
  databaseURL: "https://in-1-health-check-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "in-1-health-check",
  storageBucket: "in-1-health-check.firebasestorage.app",
  appId: "1:805963694011:android:30dcc5640fe9e5e3844e9e"
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

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
