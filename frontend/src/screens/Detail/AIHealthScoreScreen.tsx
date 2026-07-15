import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import Header from '../../components/common/Header';
import RadialGauge from '../../components/charts/RadialGauge';
import { getRiskScoreTrend } from '../../constants/mockData';
import LineChart from '../../components/charts/LineChart';
import { StatusBar } from 'expo-status-bar';
import { Brain, Zap, Shield, AlertTriangle, XCircle } from 'lucide-react-native';
import { getHeartRateStatus, getTemperatureStatus, getSpO2Status, getPIStatus } from '../../utils/clinicalRanges';

export default function AIHealthScoreScreen() {
  const { colors, isDark } = useTheme();
  const { data } = useLatestHealthRecord();
  const score = data?.healthRiskScore ?? 20;
  const riskLevel = data?.riskLevel ?? 'Low';
  const riskTrend = getRiskScoreTrend();

  const riskColor =
    score < 30 ? '#10B981' : score < 60 ? '#F59E0B' : score < 80 ? '#EF4444' : '#7C3AED';

  const factors = [
    { label: 'Heart Rate', score: data?.heartRate ?? 74, max: 150, color: '#FF6B8A', status: data ? getHeartRateStatus(data.heartRate).statusLabel : 'Optimal' },
    { label: 'SpO₂', score: data?.spo2 ?? 98, max: 100, color: '#00D4FF', status: data ? getSpO2Status(data.spo2).statusLabel : 'Excellent' },
    { label: 'Temperature', score: data?.bodyTemperature ?? 36.8, max: 42, color: '#FF9500', status: data ? getTemperatureStatus(data.bodyTemperature).statusLabel : 'Normal' },
    { label: 'Perfusion Index', score: data?.perfusionIndex ?? 5.4, max: 20, color: '#8B5CF6', status: data ? getPIStatus(data.perfusionIndex).statusLabel : 'Normal' },
    { label: 'Signal Quality', score: data?.signalStrength ?? 98, max: 100, color: '#10B981', status: 'Strong' },
  ];

  const chartW = 340;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header title="AI Health Score" subtitle="Real-time risk analysis" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}>

        {/* Gauge Hero */}
        <LinearGradient
          colors={isDark ? ['#1a2340', '#0d1b32'] : ['#EBF5FF', '#DBEAFE']}
          style={[styles.heroCard, { borderColor: `${riskColor}30` }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Brain size={18} color={riskColor} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
              AI-Computed Risk Index
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <RadialGauge
              value={score}
              size={240}
              strokeWidth={22}
              gradientColors={[riskColor, riskColor]}
              sublabel={riskLevel + ' Risk'}
            />
          </View>

          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 19 }}>
            Score computed from all 5 vital parameters using a weighted clinical algorithm
          </Text>
        </LinearGradient>

        {/* Risk Zones Legend */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>Risk Zones</Text>
          {[
            { range: '0 – 30', label: 'Low Risk', color: '#10B981', icon: <Shield size={14} color="#10B981" />, desc: 'All vitals within optimal range' },
            { range: '31 – 60', label: 'Moderate Risk', color: '#F59E0B', icon: <Zap size={14} color="#F59E0B" />, desc: 'One or more vitals slightly elevated' },
            { range: '61 – 80', label: 'High Risk', color: '#EF4444', icon: <AlertTriangle size={14} color="#EF4444" />, desc: 'Multiple vitals outside normal range' },
            { range: '81 – 100', label: 'Critical', color: '#7C3AED', icon: <XCircle size={14} color="#7C3AED" />, desc: 'Immediate medical attention required' },
          ].map((z, i) => (
            <View key={i} style={[styles.zoneRow, { backgroundColor: `${z.color}10`, borderColor: `${z.color}25` }]}>
              <View style={[styles.zoneColorBar, { backgroundColor: z.color }]} />
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {z.icon}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: z.color }}>{z.label}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>{z.desc}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>{z.range}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* Contributing Factors */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>
            Contributing Factors
          </Text>
          {factors.map((f, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>{f.label}</Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{f.score}</Text>
                  <View style={[styles.factorStatus, { backgroundColor: `${f.color}20` }]}>
                    <Text style={{ fontSize: 10, color: f.color, fontWeight: '600' }}>{f.status}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.factorBar, { backgroundColor: isDark ? '#1E2D3D' : '#EEF2F8' }]}>
                <View style={[styles.factorFill, {
                  backgroundColor: f.color,
                  width: `${Math.min((f.score / f.max) * 100, 100)}%`,
                }]} />
              </View>
            </View>
          ))}
        </LinearGradient>

        {/* Risk Score Trend */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>Score History</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>7-day risk trend</Text>
          <LineChart
            data={riskTrend}
            width={chartW}
            height={140}
            color={riskColor}
            gradientColors={[riskColor, riskColor]}
            gradientId="aiRiskChart"
          />
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderRadius: 24, borderWidth: 1, padding: 20, overflow: 'hidden' },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 10, marginBottom: 8, overflow: 'hidden', gap: 10 },
  zoneColorBar: { width: 4, height: 36, borderRadius: 2 },
  factorBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  factorFill: { height: '100%', borderRadius: 3 },
  factorStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
});
