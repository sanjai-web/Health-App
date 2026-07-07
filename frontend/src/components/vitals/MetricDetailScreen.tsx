import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Header from '../../components/common/Header';
import ProgressRing from '../../components/dashboard/ProgressRing';
import LineChart from '../../components/charts/LineChart';
import { VITAL_RANGES, VitalRange } from '../../constants/mockData';
import { StatusBar } from 'expo-status-bar';
import { Info } from 'lucide-react-native';

interface MetricDetailProps {
  metricKey: string;
  currentValue: number;
  trend: { value: number; label: string }[];
  ringValue?: number; // 0–100 normalized for the ring
}

function getRangeStatus(key: string, value: number) {
  const r = VITAL_RANGES[key];
  if (!r) return { label: 'Normal', color: '#10B981' };
  if (value < r.normalMin || value > r.normalMax) {
    return { label: 'Out of Range', color: '#F59E0B' };
  }
  return { label: 'Normal', color: '#10B981' };
}

export default function MetricDetailScreen({ metricKey, currentValue, trend, ringValue }: MetricDetailProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const range = VITAL_RANGES[metricKey] as VitalRange;
  const status = getRangeStatus(metricKey, currentValue);
  const chartW = 340;

  const normalizedRing =
    ringValue !== undefined
      ? ringValue
      : ((currentValue - range.min) / (range.max - range.min)) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header title={range.label} subtitle={range.description} showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}>

        {/* Hero metric card */}
        <LinearGradient
          colors={range.gradientColors as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroInner}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Current Reading
              </Text>
              <Text style={{ fontSize: 52, fontWeight: '700', color: '#FFF', letterSpacing: -1, marginTop: 4 }}>
                {currentValue}
              </Text>
              <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                {range.unit}
              </Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={{ fontSize: 12, color: '#FFF', fontWeight: '700' }}>{status.label}</Text>
              </View>
            </View>
            <ProgressRing
              value={Math.min(Math.max(normalizedRing, 0), 100)}
              size={120}
              strokeWidth={10}
              gradientColors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)']}
              gradientId={`${metricKey}Ring`}
              label={`${currentValue}`}
              sublabel={range.unit}
            />
          </View>
        </LinearGradient>

        {/* Normal range card */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            Reference Range
          </Text>
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>MIN NORMAL</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{range.normalMin}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>{range.unit}</Text>
            </View>
            <View style={[styles.rangeBar, { backgroundColor: colors.surface }]}>
              <View style={[styles.rangeBarFill, {
                backgroundColor: range.color,
                width: `${((currentValue - range.min) / (range.max - range.min)) * 100}%`,
              }]} />
              <View style={[styles.rangeNormalZone, {
                left: `${((range.normalMin - range.min) / (range.max - range.min)) * 100}%`,
                width: `${((range.normalMax - range.normalMin) / (range.max - range.min)) * 100}%`,
              }]} />
            </View>
            <View style={styles.rangeItem}>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>MAX NORMAL</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{range.normalMax}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>{range.unit}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Trend chart */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>7-Day Trend</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>Historical readings</Text>
          <LineChart
            data={trend}
            width={chartW}
            height={150}
            color={range.color}
            gradientColors={range.gradientColors}
            gradientId={`${metricKey}TrendChart`}
          />
        </LinearGradient>

        {/* Clinical info */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <View style={styles.infoHeader}>
            <Info size={16} color={range.color} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginLeft: 8 }}>
              Clinical Information
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: 10 }}>
            {range.clinicalInfo}
          </Text>
        </LinearGradient>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { label: 'Min (Historical)', value: Math.min(...trend.map(t => t.value)).toString() },
            { label: 'Max (Historical)', value: Math.max(...trend.map(t => t.value)).toString() },
            { label: 'Average', value: (trend.reduce((s, t) => s + t.value, 0) / trend.length).toFixed(1) },
          ].map((s, i) => (
            <LinearGradient key={i} colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.statCard, { borderColor: colors.cardBorder }]}>
              <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: range.color, marginTop: 4 }}>{s.value}</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>{range.unit}</Text>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderRadius: 24, padding: 22, overflow: 'hidden' },
  heroInner: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', marginTop: 10, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rangeItem: { alignItems: 'center', gap: 2 },
  rangeBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative' },
  rangeBarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4 },
  rangeNormalZone: { position: 'absolute', top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  infoHeader: { flexDirection: 'row', alignItems: 'center' },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, gap: 2 },
});
