import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import Header from '../../components/common/Header';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Heart, Thermometer, Wind, Activity, Brain, ChevronRight } from 'lucide-react-native';
import ProgressRing from '../../components/dashboard/ProgressRing';
import { CardSkeleton } from '../../components/common/Skeleton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Clinical status helper functions
function getHeartRateStatus(hr: number) {
  if (hr < 60) return { status: 'Low', statusColor: '#F59E0B' };
  if (hr > 100) return { status: 'Elevated', statusColor: '#EF4444' };
  return { status: 'Optimal', statusColor: '#10B981' };
}

function getTemperatureStatus(temp: number) {
  if (temp < 36.1) return { status: 'Low', statusColor: '#F59E0B' };
  if (temp > 37.2) return { status: 'Elevated', statusColor: '#EF4444' };
  return { status: 'Normal', statusColor: '#10B981' };
}

function getSpO2Status(spo2: number) {
  if (spo2 < 95) return { status: 'Low', statusColor: '#EF4444' };
  return { status: 'Excellent', statusColor: '#10B981' };
}

function getPIStatus(pi: number) {
  if (pi < 1.0) return { status: 'Low', statusColor: '#F59E0B' };
  if (pi > 10.0) return { status: 'Elevated', statusColor: '#EF4444' };
  return { status: 'Normal', statusColor: '#10B981' };
}

const getRiskColor = (risk: string) => {
  if (risk === 'High') return '#EF4444';
  if (risk === 'Medium' || risk === 'Moderate') return '#F59E0B';
  return '#10B981';
};

interface VitalRowProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  gradientColors: string[];
  progress: number;
  status: string;
  statusColor: string;
  route: keyof RootStackParamList;
}

function VitalRow({ label, value, unit, icon, gradientColors, progress, status, statusColor, route }: VitalRowProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <TouchableOpacity onPress={() => navigation.navigate(route as any)} activeOpacity={0.8}>
      <LinearGradient
        colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
        style={[styles.vitalRow, { borderColor: colors.cardBorder }]}
      >
        {/* Icon */}
        <LinearGradient colors={gradientColors as any} style={styles.vitalIcon}>
          {icon}
        </LinearGradient>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>{label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>
              {value}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{unit}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={{ fontSize: 10, color: statusColor, fontWeight: '600' }}>{status}</Text>
          </View>
        </View>

        {/* Ring */}
        <ProgressRing
          value={progress}
          size={56}
          strokeWidth={5}
          gradientColors={gradientColors}
          gradientId={`vd_${label.replace(/\s/g, '')}`}
          label=""
          showValue={false}
          animated
        />

        <ChevronRight size={15} color={colors.textMuted} style={{ marginLeft: 6 }} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function VitalsDetailScreen() {
  const { colors, isDark } = useTheme();
  const { data, loading } = useLatestHealthRecord();
  const navigation = useNavigation<Nav>();

  const vitals: VitalRowProps[] = data ? [
    {
      label: 'Heart Rate',
      value: data.heartRate,
      unit: 'BPM',
      icon: <Heart size={20} color="#FFF" />,
      gradientColors: ['#FF6B8A', '#C2185B'],
      progress: ((data.heartRate - 30) / (200 - 30)) * 100,
      route: 'HeartRateDetail',
      ...getHeartRateStatus(data.heartRate),
    },
    {
      label: 'Body Temperature',
      value: data.bodyTemperature,
      unit: '°C',
      icon: <Thermometer size={20} color="#FFF" />,
      gradientColors: ['#FF9500', '#E65100'],
      progress: ((data.bodyTemperature - 34) / (42 - 34)) * 100,
      route: 'TemperatureDetail',
      ...getTemperatureStatus(data.bodyTemperature),
    },
    {
      label: 'SpO₂',
      value: data.spo2,
      unit: '%',
      icon: <Wind size={20} color="#FFF" />,
      gradientColors: ['#00D4FF', '#0288D1'],
      progress: data.spo2,
      route: 'SpO2Detail',
      ...getSpO2Status(data.spo2),
    },
    {
      label: 'Perfusion Index',
      value: data.perfusionIndex,
      unit: '%',
      icon: <Activity size={20} color="#FFF" />,
      gradientColors: ['#8B5CF6', '#5B21B6'],
      progress: (data.perfusionIndex / 20) * 100,
      route: 'PerfusionDetail',
      ...getPIStatus(data.perfusionIndex),
    },
  ] : [];

  const riskColor = data ? getRiskColor(data.riskLevel) : '#10B981';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header title="All Vitals" subtitle="Tap any metric for details" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 10 }}>

        {/* Overall Score Card */}
        {data && (
          <TouchableOpacity onPress={() => navigation.navigate('AIHealthScore')}>
            <LinearGradient
              colors={isDark ? ['#1a2340', '#0d1b32'] : ['#EBF5FF', '#DBEAFE']}
              style={[styles.overallCard, { borderColor: `${riskColor}30` }]}
            >
              <Brain size={18} color={riskColor} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>Overall AI Health Score</Text>
                <Text style={{ fontSize: 28, fontWeight: '700', color: riskColor, letterSpacing: -0.5 }}>
                  {data.healthRiskScore}{' '}
                  <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '400' }}>/ 100</Text>
                </Text>
              </View>
              <View style={[styles.overallBadge, { backgroundColor: `${riskColor}18`, borderColor: `${riskColor}30` }]}>
                <Text style={{ fontSize: 12, color: riskColor, fontWeight: '700' }}>
                  {data.riskLevel} Risk
                </Text>
              </View>
              <ChevronRight size={15} color={colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8, marginTop: 6 }}>
          INDIVIDUAL MEASUREMENTS
        </Text>

        {/* Vitals List */}
        {loading
          ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} height={90} />)
          : vitals.map((v, i) => <VitalRow key={i} {...v} />)
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overallCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 6 },
  overallBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  vitalRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, borderWidth: 1, padding: 14 },
  vitalIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
});
