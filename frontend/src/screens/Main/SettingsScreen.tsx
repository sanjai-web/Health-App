import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  User, Bell, Database, Info, Moon, Sun,
  ChevronRight, Shield, FileText, Cpu,
} from 'lucide-react-native';
import { useTheme, ThemeContext } from '../../hooks/useTheme';
import { RootStackParamList } from '../../navigation/types';
import { StatusBar } from 'expo-status-bar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
  color?: string;
}

function SettingsRow({ icon, label, sublabel, onPress, rightEl, color }: SettingsRowProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[styles.row, { borderBottomColor: colors.cardBorder }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${color ?? colors.accent}18` }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>{label}</Text>
        {sublabel && <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{sublabel}</Text>}
      </View>
      {rightEl ?? (onPress ? <ChevronRight size={16} color={colors.textMuted} /> : null)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDark ? ['#0A0F1E', 'rgba(10,15,30,0)'] : ['#F0F4F8', 'rgba(240,244,248,0)']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12 }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>Settings</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 20 }}>

        {/* Profile section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ACCOUNT</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingsRow
            icon={<User size={18} color="#3B82F6" />}
            label="My Profile"
            sublabel="Personal information"
            color="#3B82F6"
            onPress={() => navigation.navigate('Profile')}
          />
          <SettingsRow
            icon={<Bell size={18} color="#F59E0B" />}
            label="Notifications"
            sublabel="Alerts and reminders"
            color="#F59E0B"
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>

        {/* Data section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DATA</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingsRow
            icon={<FileText size={18} color="#EC4899" />}
            label="Medical Report"
            sublabel="Generate health summary"
            color="#EC4899"
            onPress={() => navigation.navigate('MedicalReport')}
          />
          <SettingsRow
            icon={<Shield size={18} color="#64748B" />}
            label="Data Privacy"
            sublabel="All data stays on your device"
            color="#64748B"
          />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingsRow
            icon={isDark ? <Moon size={18} color="#00D4FF" /> : <Sun size={18} color="#F59E0B" />}
            label={isDark ? 'Dark Mode' : 'Light Mode'}
            sublabel="Toggle app theme"
            color={isDark ? '#00D4FF' : '#F59E0B'}
            rightEl={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#334155', true: '#00D4FF44' }}
                thumbColor={isDark ? '#00D4FF' : '#94A3B8'}
              />
            }
          />
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ABOUT</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingsRow
            icon={<Info size={18} color="#3B82F6" />}
            label="App Version"
            sublabel="v1.0.0 · Build 1"
            color="#3B82F6"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  group: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14, borderBottomWidth: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
