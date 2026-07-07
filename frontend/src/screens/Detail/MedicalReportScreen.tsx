import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import Header from '../../components/common/Header';
import { StatusBar } from 'expo-status-bar';
import { Heart, Thermometer, Wind, Activity, Brain, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { VITAL_RANGES } from '../../constants/mockData';

interface ReportRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning';
  range: string;
  color: string;
}

function ReportRow({ icon, label, value, unit, status, range, color }: ReportRowProps) {
  const { colors } = useTheme();
  const statusColor = status === 'normal' ? '#10B981' : '#F59E0B';
  return (
    <View style={[styles.reportRow, { borderBottomColor: colors.cardBorder }]}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}18` }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{label}</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>Ref: {range}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color }}>
          {value} <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textMuted }}>{unit}</Text>
        </Text>
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
          {status === 'normal'
            ? <CheckCircle size={9} color={statusColor} />
            : <AlertTriangle size={9} color={statusColor} />}
          <Text style={{ fontSize: 9, color: statusColor, fontWeight: '700', marginLeft: 3 }}>
            {status === 'normal' ? 'NORMAL' : 'REVIEW'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function MedicalReportScreen() {
  const { colors, isDark } = useTheme();
  const { data } = useLatestHealthRecord();

  if (!data) return null;

  const reportDate = new Date(data.timestamp).toLocaleDateString([], {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const reportTime = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const riskColor = data.healthRiskScore < 30 ? '#10B981' : data.healthRiskScore < 60 ? '#F59E0B' : '#EF4444';

  const hasAnomaly = 
    data.heartRate < 60 || data.heartRate > 100 ||
    data.bodyTemperature < 36.1 || data.bodyTemperature > 37.2 ||
    data.spo2 < 95 ||
    data.perfusionIndex < 1.0 || data.perfusionIndex > 10.0;

  const interpretationText = hasAnomaly
    ? `Some measured vital parameters are outside standard clinical reference ranges. The AI-computed Health Risk Score of ${data.healthRiskScore}/100 classifies this reading as ${data.riskLevel} Risk. Further monitoring or clinical review is advised.\n\nHeart rate is at ${data.heartRate} BPM, SpO₂ is at ${data.spo2}%, body temperature is at ${data.bodyTemperature}°C, and perfusion index is at ${data.perfusionIndex}%.`
    : `All measured vital parameters are within normal clinical reference ranges. The AI-computed Health Risk Score of ${data.healthRiskScore}/100 classifies this reading as ${data.riskLevel} Risk.\n\nHeart rate at ${data.heartRate} BPM and SpO₂ at ${data.spo2}% indicate healthy cardiovascular and respiratory function. Body temperature of ${data.bodyTemperature}°C is normal. Perfusion index of ${data.perfusionIndex}% confirms adequate peripheral circulation.`;

  const vitals: ReportRowProps[] = [
    {
      icon: <Heart size={16} color="#FF6B8A" />,
      label: 'Heart Rate',
      value: `${data.heartRate}`,
      unit: 'BPM',
      status: (data.heartRate < 60 || data.heartRate > 100) ? 'warning' : 'normal',
      range: '60–100 BPM',
      color: '#FF6B8A',
    },
    {
      icon: <Thermometer size={16} color="#FF9500" />,
      label: 'Body Temperature',
      value: `${data.bodyTemperature}`,
      unit: '°C',
      status: (data.bodyTemperature < 36.1 || data.bodyTemperature > 37.2) ? 'warning' : 'normal',
      range: '36.1–37.2 °C',
      color: '#FF9500',
    },
    {
      icon: <Wind size={16} color="#00D4FF" />,
      label: 'SpO₂',
      value: `${data.spo2}`,
      unit: '%',
      status: data.spo2 < 95 ? 'warning' : 'normal',
      range: '≥ 95%',
      color: '#00D4FF',
    },
    {
      icon: <Activity size={16} color="#8B5CF6" />,
      label: 'Perfusion Index',
      value: `${data.perfusionIndex}`,
      unit: '%',
      status: (data.perfusionIndex < 1.0 || data.perfusionIndex > 10.0) ? 'warning' : 'normal',
      range: '1–10%',
      color: '#8B5CF6',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header title="Medical Report" subtitle="Health Summary" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}>

        {/* Report Header */}
        <LinearGradient
          colors={isDark ? ['#1a2340', '#0d1b32'] : ['#EBF5FF', '#DBEAFE']}
          style={[styles.reportHeader, { borderColor: colors.cardBorder }]}
        >
          <View style={styles.reportHeaderTop}>
            <View>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                Health Summary Report
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 }}>Fitcheck Vital Assessment</Text>
            </View>
            <View style={[styles.overallBadge, { backgroundColor: `${riskColor}20`, borderColor: `${riskColor}40` }]}>
              <Text style={{ fontSize: 10, color: riskColor, fontWeight: '700', textTransform: 'uppercase' }}>
                {data.riskLevel}
              </Text>
            </View>
          </View>
          <View style={[styles.reportMeta, { borderTopColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>📅 {reportDate}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>🕐 {reportTime}</Text>
          </View>
        </LinearGradient>

        {/* AI Score Summary */}
        <LinearGradient
          colors={[`${riskColor}20`, `${riskColor}08`]}
          style={[styles.scoreCard, { borderColor: `${riskColor}30` }]}
        >
          <Brain size={20} color={riskColor} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>AI Health Risk Score</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <Text style={{ fontSize: 36, fontWeight: '700', color: riskColor, letterSpacing: -0.5 }}>
                {data.healthRiskScore}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>/ 100</Text>
            </View>
          </View>
          <CheckCircle size={28} color={riskColor} />
        </LinearGradient>

        {/* Vitals Table */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            Measured Parameters
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 14 }}>
            All 5 vital signs with clinical reference ranges
          </Text>
          {vitals.map((v, i) => <ReportRow key={i} {...v} />)}
        </LinearGradient>

        {/* Interpretation */}
        <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
          style={[styles.card, { borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
            Clinical Interpretation
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
            {interpretationText}
          </Text>
        </LinearGradient>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: `${colors.accentOrange}10`, borderColor: `${colors.accentOrange}20` }]}>
          <AlertTriangle size={13} color={colors.accentOrange} />
          <Text style={{ fontSize: 11, color: colors.textMuted, flex: 1, lineHeight: 16, marginLeft: 8 }}>
            This report is generated for personal monitoring purposes only and does not replace professional medical diagnosis. Consult a qualified healthcare provider for clinical decisions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  reportHeader: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 12 },
  reportHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  overallBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  reportMeta: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1 },
  scoreCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  disclaimer: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'flex-start' },
});
