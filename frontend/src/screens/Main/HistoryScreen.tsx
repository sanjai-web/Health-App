import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Heart, Thermometer, Wind, Activity, Brain, ChevronRight, Clock } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAllHealthRecords } from '../../hooks/useHealthData';
import { HealthRecord } from '../../constants/mockData';
import { RootStackParamList } from '../../navigation/types';
import { CardSkeleton } from '../../components/common/Skeleton';
import { StatusBar } from 'expo-status-bar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function getRiskColor(risk: string) {
  if (risk === 'Low') return '#10B981';
  if (risk === 'Moderate') return '#F59E0B';
  if (risk === 'High') return '#EF4444';
  return '#7C3AED';
}

function RecordCard({ record }: { record: HealthRecord }) {
  const { colors, isDark } = useTheme();
  const { date, time } = formatDateTime(record.timestamp);
  const riskColor = getRiskColor(record.riskLevel);

  const vitals = [
    { icon: <Heart size={12} color="#FF6B8A" />, value: `${record.heartRate} BPM` },
    { icon: <Thermometer size={12} color="#FF9500" />, value: `${record.bodyTemperature}°C` },
    { icon: <Wind size={12} color="#00D4FF" />, value: `${record.spo2}%` },
    { icon: <Activity size={12} color="#8B5CF6" />, value: `PI ${record.perfusionIndex}` },
  ];

  return (
    <LinearGradient
      colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFFFFF', '#F8FAFC']}
      style={[styles.recordCard, { borderColor: colors.cardBorder }]}
    >
      {/* Top row: timestamp + risk badge */}
      <View style={styles.cardTop}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Clock size={13} color={colors.textMuted} />
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{date}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{time}</Text>
          </View>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: `${riskColor}20`, borderColor: `${riskColor}40` }]}>
          <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
          <Text style={{ fontSize: 11, color: riskColor, fontWeight: '700' }}>{record.riskLevel}</Text>
        </View>
      </View>

      {/* AI Score */}
      <View style={styles.scoreRow}>
        <Brain size={14} color={colors.textMuted} />
        <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 5 }}>AI Health Score:</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: riskColor, marginLeft: 4 }}>
          {record.healthRiskScore}
        </Text>
      </View>

      {/* Vitals strip */}
      <View style={styles.vitalsStrip}>
        {vitals.map((v, i) => (
          <View key={i} style={[styles.vitalPill, { backgroundColor: colors.surface }]}>
            {v.icon}
            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '500', marginLeft: 4 }}>
              {v.value}
            </Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const { data, loading } = useAllHealthRecords();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <LinearGradient
        colors={isDark ? ['#0A0F1E', 'rgba(10,15,30,0)'] : ['#F0F4F8', 'rgba(240,244,248,0)']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12 }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          History
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
          {data.length} readings recorded
        </Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 12 }}
      >
        {loading
          ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} height={140} />)
          : data.map(record => <RecordCard key={record.id} record={record} />)
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  recordCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  riskBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, gap: 5 },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
  vitalsStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  vitalPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
});
