import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/Main/HomeScreen';
import AnalyticsScreen from '../screens/Main/AnalyticsScreen';
import HistoryScreen from '../screens/Main/HistoryScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';
import { Heart, BarChart3, ClockIcon, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      id="main"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.4 : 0.1,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          const size = focused ? 24 : 22;
          if (route.name === 'Home') return <Heart size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Analytics') return <BarChart3 size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'History') return <ClockIcon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Settings') return <Settings size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          return <View />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: 'Analytics' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}
