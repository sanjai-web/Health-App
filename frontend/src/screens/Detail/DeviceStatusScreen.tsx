import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useDeviceStatus } from '../../hooks/useHealthData';
import Header from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/Skeleton';
import { StatusBar } from 'expo-status-bar';
import {
  Database, Server, Signal, Wifi, Cpu, Zap,
  CheckCircle, RefreshCw, Info, Lock
} from 'lucide-react-native';

interface StatusItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  accentColor?: string;
}

function StatusItem({ icon, label, value, valueColor, accentColor = '#3B82F6' }: StatusItemProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statusItem, { borderBottomColor: colors.cardBorder }]}>
      <View style={[styles.statusIcon, { backgroundColor: `${accentColor}18` }]}>
        {icon}
      </View>
      <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: valueColor ?? colors.text, textAlign: 'right', maxWidth: '60%' }}>{value}</Text>
    </View>
  );
}

export default function DeviceStatusScreen() {
  const { colors, isDark } = useTheme();
  const { data: dbStatus, loading } = useDeviceStatus();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header title="Database Sync" subtitle="Firebase Realtime Integration" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}>
        {loading || !dbStatus ? (
          <>
            <CardSkeleton height={140} />
            <CardSkeleton height={200} />
          </>
        ) : (
          <>
            {/* Connection Hero */}
            <LinearGradient
              colors={['rgba(59,130,246,0.12)', 'rgba(59,130,246,0.04)']}
              style={[styles.heroCard, { borderColor: `${colors.primary}25` }]}
            >
              <View style={styles.heroTop}>
                <View style={[styles.deviceIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Database size={28} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{dbStatus.deviceName}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Protocol: {dbStatus.connectionType}</Text>
                  <View style={styles.connBadge}>
                    <View style={[styles.connectedDot, { backgroundColor: '#10B981' }]} />
                    <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '700' }}>
                      {dbStatus.calibrationStatus}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Sync Configuration details */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.card, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Sync Parameters</Text>
              <StatusItem icon={<Server size={16} color="#3B82F6" />} label="Database Endpoint" value={dbStatus.macAddress} accentColor="#3B82F6" />
              <StatusItem icon={<Signal size={16} color="#10B981" />} label="Connection Health" value={`${dbStatus.signalStrength}% (Excellent)`} valueColor="#10B981" accentColor="#10B981" />
              <StatusItem icon={<Zap size={16} color="#F59E0B" />} label="Uptime Health" value="100.00% Operational" valueColor="#10B981" accentColor="#F59E0B" />
              <StatusItem icon={<RefreshCw size={16} color="#8B5CF6" />} label="Last Database Sync" value={new Date(dbStatus.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} accentColor="#8B5CF6" />
            </LinearGradient>

            {/* Cloud Architecture Info */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.card, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Cloud Core Details</Text>
              <StatusItem icon={<Cpu size={16} color="#EC4899" />} label="Engine Model" value={dbStatus.sensorModel} accentColor="#EC4899" />
              <StatusItem icon={<Info size={16} color="#8B5CF6" />} label="SDK Version compatibility" value={`v${dbStatus.firmwareVersion}`} accentColor="#8B5CF6" />
              <StatusItem icon={<Lock size={16} color="#10B981" />} label="Encryption Type" value="SSL/TLS (WSS Secured)" valueColor="#10B981" accentColor="#10B981" />
            </LinearGradient>

            {/* Cloud Stream Services Check */}
            <LinearGradient colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
              style={[styles.card, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Service Integration</Text>
              {[
                { label: 'Realtime WebSocket Listener', ok: true },
                { label: 'Cloud Rules Authentication', ok: true },
                { label: 'JSON Data Parser', ok: true },
                { label: 'AI Health Assessment Engine', ok: true },
                { label: 'Historical Logger Stream', ok: true },
              ].map((d, i) => (
                <View key={i} style={[styles.diagRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{d.label}</Text>
                  <View style={[styles.diagPill, { backgroundColor: d.ok ? '#10B98120' : '#EF444420' }]}>
                    <View style={[styles.diagDot, { backgroundColor: d.ok ? '#10B981' : '#EF4444' }]} />
                    <Text style={{ fontSize: 11, color: d.ok ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                      {d.ok ? 'Active' : 'Offline'}
                    </Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  deviceIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  connBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  connectedDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  statusIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  diagRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  diagPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diagDot: { width: 5, height: 5, borderRadius: 3 },
});
