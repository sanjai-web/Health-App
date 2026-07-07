import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAllHealthRecords } from '../../hooks/useHealthData';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import {
  getHeartRateTrend, getTemperatureTrend, getSpO2Trend,
  getRiskScoreTrend, getPerfusionTrend,
} from '../../constants/mockData';
import { CardSkeleton } from '../../components/common/Skeleton';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const CHART_W = width - 40 - 32; // full card width minus padding

const TABS = ['Overview', 'Vitals', 'Risk'];

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const { loading } = useAllHealthRecords();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  const hrTrend = getHeartRateTrend();
  const tempTrend = getTemperatureTrend();
  const spo2Trend = getSpO2Trend();
  const riskTrend = getRiskScoreTrend();
  const piTrend = getPerfusionTrend();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#0A0F1E', 'rgba(10,15,30,0)'] : ['#F0F4F8', 'rgba(240,244,248,0)']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12 }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          Analytics
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
          7-day trend overview
        </Text>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: activeTab === i ? colors.accent : colors.textMuted }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}
      >
        {loading ? (
          <>
            <CardSkeleton height={220} />
            <CardSkeleton height={220} />
          </>
        ) : activeTab === 0 ? (
          <>
            {/* Heart Rate + SpO2 side-by-side stat cards */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { label: 'Avg Heart Rate', value: '74', unit: 'BPM', color: '#FF6B8A' },
                { label: 'Avg SpO₂', value: '97.4', unit: '%', color: '#00D4FF' },
              ].map((s, i) => (
                <LinearGradient key={i} colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
                  style={[styles.statCard, { borderColor: colors.cardBorder }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
                  <Text style={{ fontSize: 32, fontWeight: '700', color: s.color, letterSpacing: -0.5, marginTop: 4 }}>{s.value}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>{s.unit}</Text>
                </LinearGradient>
              ))}
            </View>

            {/* Heart Rate Line Chart */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.chartCard, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Heart Rate Trend</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>Last 7 readings</Text>
              <LineChart data={hrTrend} width={CHART_W} height={150} color="#FF6B8A" gradientColors={['#FF6B8A', '#C2185B']} gradientId="hrChart" />
            </LinearGradient>

            {/* SpO2 Line Chart */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.chartCard, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>SpO₂ Saturation</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>Blood oxygen over time</Text>
              <LineChart data={spo2Trend} width={CHART_W} height={150} color="#00D4FF" gradientColors={['#00D4FF', '#0288D1']} gradientId="spo2Chart" />
            </LinearGradient>

            {/* Risk Distribution Donut */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.chartCard, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Risk Distribution</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>Reading classification breakdown</Text>
              <View style={{ alignItems: 'center' }}>
                <DonutChart
                  data={[
                    { value: 86, color: '#10B981', label: 'Low' },
                    { value: 14, color: '#F59E0B', label: 'Moderate' },
                  ]}
                  size={160}
                  centerLabel="86%"
                  centerSublabel="Low Risk"
                />
              </View>
            </LinearGradient>
          </>
        ) : activeTab === 1 ? (
          <>
            {/* Temperature Bar Chart */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.chartCard, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Body Temperature</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>°C across sessions</Text>
              <BarChart data={tempTrend} width={CHART_W} height={150} gradientColors={['#FF9500', '#E65100']} gradientId="tempBar" />
            </LinearGradient>

            {/* Perfusion Index Line */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.chartCard, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Perfusion Index</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>Peripheral circulation quality</Text>
              <LineChart data={piTrend} width={CHART_W} height={150} color="#8B5CF6" gradientColors={['#8B5CF6', '#5B21B6']} gradientId="piChart" />
            </LinearGradient>
          </>
        ) : (
          <>
            {/* Risk Score Bar Chart */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.chartCard, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Health Risk Score History</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>AI-computed 0–100 scale</Text>
              <BarChart data={riskTrend} width={CHART_W} height={150} gradientColors={['#3B82F6', '#1D4ED8']} gradientId="riskBar" />
            </LinearGradient>

            {/* Weekly Summary Cards */}
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 }}>
              Weekly Insights
            </Text>
            {[
              { label: 'All readings classified Low Risk', value: '6/7', color: '#10B981' },
              { label: 'Average Risk Score', value: '20.7', color: '#3B82F6' },
              { label: 'Peak Risk Score', value: '30', color: '#F59E0B' },
              { label: 'Lowest Risk Score', value: '15', color: '#10B981' },
            ].map((s, i) => (
              <LinearGradient key={i} colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
                style={[styles.insightRow, { borderColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{s.label}</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: s.color }}>{s.value}</Text>
              </LinearGradient>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  chartCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, gap: 2 },
  insightRow: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
});
