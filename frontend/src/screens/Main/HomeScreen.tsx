import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Heart, Thermometer, Wind, Activity, Brain,
  Bell, ChevronRight, Zap, Cloud
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import { useAirQuality } from '../../hooks/useAirQuality';
import { RootStackParamList } from '../../navigation/types';
import MetricCard from '../../components/dashboard/MetricCard';
import ProgressRing from '../../components/dashboard/ProgressRing';
import { MetricCardSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import { StatusBar } from 'expo-status-bar';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

import { getHeartRateStatus, getTemperatureStatus, getSpO2Status, getPIStatus } from '../../utils/clinicalRanges';

// UI helper functions for AI risk color-coding
const getRiskColor = (risk: string) => {
  if (risk === 'High') return '#EF4444';
  if (risk === 'Medium' || risk === 'Moderate') return '#F59E0B';
  return '#10B981';
};

const getRiskGradient = (risk: string) => {
  if (risk === 'High') return ['#EF4444', '#B91C1C'];
  if (risk === 'Medium' || risk === 'Moderate') return ['#F59E0B', '#D97706'];
  return ['#10B981', '#059669'];
};

// UI helper function for Air Quality Index ranges
const getAqiStatus = (aqi: number) => {
  if (aqi <= 50) return { status: 'normal' as const, statusLabel: 'Good' };
  if (aqi <= 100) return { status: 'warning' as const, statusLabel: 'Moderate' };
  if (aqi <= 150) return { status: 'warning' as const, statusLabel: 'Sensitive' };
  if (aqi <= 200) return { status: 'critical' as const, statusLabel: 'Unhealthy' };
  return { status: 'critical' as const, statusLabel: 'Hazardous' };
};

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { data, loading } = useLatestHealthRecord();
  const { aqi, city, loading: aqiLoading, error: aqiError } = useAirQuality();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const aqiValue = aqiLoading ? '--' : aqi !== null ? aqi : '--';
  const aqiLabel = aqiLoading ? 'Loading...' : aqiError ? 'Location Error' : (city || 'Local Area');
  const aqiStatus = aqi !== null ? getAqiStatus(aqi) : { status: 'normal' as const, statusLabel: 'No Data' };

  const metrics = [];
  if (data) {
    metrics.push(
      {
        label: 'Heart Rate',
        value: data.heartRate,
        unit: 'BPM',
        icon: <Heart size={22} color="#FFF" />,
        gradientColors: ['#FF6B8A', '#C2185B'],
        route: 'HeartRateDetail' as const,
        ...getHeartRateStatus(data.heartRate),
      },
      {
        label: 'Temperature',
        value: data.bodyTemperature,
        unit: '°C',
        icon: <Thermometer size={22} color="#FFF" />,
        gradientColors: ['#FF9500', '#E65100'],
        route: 'TemperatureDetail' as const,
        ...getTemperatureStatus(data.bodyTemperature),
      },
      {
        label: 'SpO₂',
        value: data.spo2,
        unit: '%',
        icon: <Wind size={22} color="#FFF" />,
        gradientColors: ['#00D4FF', '#0288D1'],
        route: 'SpO2Detail' as const,
        ...getSpO2Status(data.spo2),
      },
      {
        label: 'Perfusion Index',
        value: data.perfusionIndex,
        unit: '%',
        icon: <Activity size={22} color="#FFF" />,
        gradientColors: ['#8B5CF6', '#5B21B6'],
        route: 'PerfusionDetail' as const,
        ...getPIStatus(data.perfusionIndex),
      },
      {
        label: `AQI: ${aqiLabel}`,
        value: aqiValue,
        unit: '',
        icon: <Cloud size={22} color="#FFF" />,
        gradientColors: ['#34D399', '#059669'], // Emerald green gradient
        route: undefined,
        ...aqiStatus,
      }
    );
  }

  const riskColor = data ? getRiskColor(data.riskLevel) : '#10B981';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header */}
      <LinearGradient
        colors={isDark ? ['#0A0F1E', 'rgba(10,15,30,0)'] : ['#F0F4F8', 'rgba(240,244,248,0)']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12, zIndex: 10 }}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '700' }}>Live Cloud Stream</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.4, marginTop: 2 }}>
              Vitals Dashboard
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.cardBorder }]}
          >
            <Bell size={20} color={colors.text} />
            <View style={[styles.notifDot, { borderColor: colors.background }]} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 }}
      >
        {/* AI Health Score Hero */}
        {loading ? (
          <CardSkeleton height={220} />
        ) : data ? (
          <TouchableOpacity onPress={() => navigation.navigate('AIHealthScore')}>
            <LinearGradient
              colors={isDark ? ['#1a2340', '#0d1b32'] : ['#EBF5FF', '#DBEAFE']}
              style={[styles.heroCard, { borderColor: colors.cardBorder }]}
            >
              <View style={styles.heroCardInner}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    AI Risk Index
                  </Text>
                  <Text style={{ fontSize: 48, fontWeight: '700', color: riskColor, letterSpacing: -1, marginTop: 4 }}>
                    {data.healthRiskScore}%
                  </Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${riskColor}12`, borderColor: `${riskColor}30` }]}>
                    <Zap size={10} color={riskColor} fill={riskColor} />
                    <Text style={{ fontSize: 11, color: riskColor, fontWeight: '700', marginLeft: 4 }}>
                      {data.riskLevel} Risk
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 8 }}>
                    {formatTime(data.timestamp)}
                  </Text>
                </View>
                <View style={styles.ringWrapper}>
                  <ProgressRing
                    value={100 - data.healthRiskScore}
                    size={120}
                    strokeWidth={11}
                    gradientColors={getRiskGradient(data.riskLevel)}
                    gradientId="homeHealthRing"
                    label={`${data.healthRiskScore}`}
                    sublabel="/ 100"
                  />
                </View>
              </View>

              {/* Bottom CTA */}
              <View style={[styles.heroCTA, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                <Brain size={14} color={colors.textMuted} />
                <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 6 }}>
                  Tap to view detailed AI analysis
                </Text>
                <ChevronRight size={14} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : null}

        {/* Section: Vital Metrics */}
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Real-time Vitals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VitalsDetail')}>
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '600' }}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.grid}>
            {Array(4).fill(0).map((_, i) => <MetricCardSkeleton key={i} />)}
          </View>
        ) : (
          <View style={styles.grid}>
            {metrics.map((m, i) => (
              <MetricCard
                key={i}
                label={m.label}
                value={m.value}
                unit={m.unit}
                icon={m.icon}
                gradientColors={m.gradientColors}
                status={m.status}
                statusLabel={m.statusLabel}
                onPress={m.route ? () => navigation.navigate(m.route) : undefined}
              />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { label: 'Medical Report', icon: <Activity size={20} color="#3B82F6" />, bg: '#3B82F620', route: 'MedicalReport' as const },
            { label: 'Vitals Detail', icon: <Heart size={20} color="#FF6B8A" />, bg: '#FF6B8A20', route: 'VitalsDetail' as const },
            { label: 'AI Risk Analysis', icon: <Brain size={20} color="#8B5CF6" />, bg: '#8B5CF620', route: 'AIHealthScore' as const },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(action.route)}
              style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                {action.icon}
              </View>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5 },
  heroCard: { borderRadius: 24, borderWidth: 1, padding: 20, overflow: 'hidden' },
  heroCardInner: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8, borderWidth: 1 },
  ringWrapper: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  heroCTA: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickActionBtn: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center' },
  quickActionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
