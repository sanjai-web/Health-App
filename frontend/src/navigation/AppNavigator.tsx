import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/Splash/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import TabNavigator from './TabNavigator';
import HeartRateDetailScreen from '../screens/Detail/HeartRateDetailScreen';
import TemperatureDetailScreen from '../screens/Detail/TemperatureDetailScreen';
import SpO2DetailScreen from '../screens/Detail/SpO2DetailScreen';
import PerfusionDetailScreen from '../screens/Detail/PerfusionDetailScreen';
import RiskScoreDetailScreen from '../screens/Detail/RiskScoreDetailScreen';
import AIHealthScoreScreen from '../screens/Detail/AIHealthScoreScreen';
import MedicalReportScreen from '../screens/Detail/MedicalReportScreen';
import NotificationsScreen from '../screens/Detail/NotificationsScreen';
import ProfileScreen from '../screens/Detail/ProfileScreen';
import VitalsDetailScreen from '../screens/Detail/VitalsDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      id="root"
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="VitalsDetail" component={VitalsDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="HeartRateDetail" component={HeartRateDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="TemperatureDetail" component={TemperatureDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SpO2Detail" component={SpO2DetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PerfusionDetail" component={PerfusionDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="RiskScoreDetail" component={RiskScoreDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AIHealthScore" component={AIHealthScoreScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="MedicalReport" component={MedicalReportScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
