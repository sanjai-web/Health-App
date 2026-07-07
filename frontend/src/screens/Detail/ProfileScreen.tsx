import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import Header from '../../components/common/Header';
import { StatusBar } from 'expo-status-bar';
import { User, Heart, Calendar, MapPin, Phone, Mail, Shield, Edit2, Check, X } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getDatabase, ref, set, get } from 'firebase/database';

// Memory fallback cache
let cachedProfile = {
  fullName: 'Alex River',
  age: '28',
  dob: 'Jan 18, 1998',
  location: 'San Francisco, CA',
  phone: '+1 (555) 019-2834',
  email: 'alex.river@healthmail.com',
  bloodType: 'O-Positive',
  conditions: 'None reported',
  heightWeight: '178 cm / 72 kg',
};

function AvatarIllustration({ color }: { color: string }) {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      <Circle cx={40} cy={40} r={38} fill={`${color}22`} />
      <Circle cx={40} cy={30} r={14} fill={`${color}60`} />
      <Path
        d="M12 70 Q12 50 40 50 Q68 50 68 70"
        fill={`${color}60`}
      />
    </Svg>
  );
}

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isEditing: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  color?: string;
}

function ProfileField({
  icon,
  label,
  value,
  onChangeText,
  isEditing,
  keyboardType = 'default',
  color = '#3B82F6',
}: ProfileFieldProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.field, { borderBottomColor: colors.cardBorder }]}>
      <View style={[styles.fieldIcon, { backgroundColor: `${color}18` }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
        {isEditing ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholder={`Enter your ${label.toLowerCase()}`}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: isDark ? '#1A2235' : '#F1F5F9',
                borderColor: colors.cardBorder,
              },
            ]}
          />
        ) : (
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 4 }}>
            {value.trim() === '' ? '— Not set —' : value}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize form state
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [conditions, setConditions] = useState('');
  const [heightWeight, setHeightWeight] = useState('');

  // Fetch profile details from Firebase when screen mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const db = getDatabase();
        const profileRef = ref(db, 'user_profile');
        const snapshot = await get(profileRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setFullName(val.fullName || '');
          setAge(val.age || '');
          setDob(val.dob || '');
          setLocation(val.location || '');
          setPhone(val.phone || '');
          setEmail(val.email || '');
          setBloodType(val.bloodType || '');
          setConditions(val.conditions || '');
          setHeightWeight(val.heightWeight || '');
          cachedProfile = val;
        } else {
          // Fallback to defaults
          setFullName(cachedProfile.fullName);
          setAge(cachedProfile.age);
          setDob(cachedProfile.dob);
          setLocation(cachedProfile.location);
          setPhone(cachedProfile.phone);
          setEmail(cachedProfile.email);
          setBloodType(cachedProfile.bloodType);
          setConditions(cachedProfile.conditions);
          setHeightWeight(cachedProfile.heightWeight);
        }
      } catch (err) {
        console.error('Failed to fetch profile from Firebase:', err);
        // Fallback to local
        setFullName(cachedProfile.fullName);
        setAge(cachedProfile.age);
        setDob(cachedProfile.dob);
        setLocation(cachedProfile.location);
        setPhone(cachedProfile.phone);
        setEmail(cachedProfile.email);
        setBloodType(cachedProfile.bloodType);
        setConditions(cachedProfile.conditions);
        setHeightWeight(cachedProfile.heightWeight);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    if (fullName.trim() === '') {
      Alert.alert('Error', 'Full Name is required.');
      return;
    }
    
    setLoading(true);
    try {
      const db = getDatabase();
      const profileRef = ref(db, 'user_profile');
      const updatedProfile = {
        fullName,
        age,
        dob,
        location,
        phone,
        email,
        bloodType,
        conditions,
        heightWeight,
      };

      await set(profileRef, updatedProfile);
      cachedProfile = updatedProfile;
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Save Failed', 'Could not sync profile details with database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Revert form state to cache
    setFullName(cachedProfile.fullName);
    setAge(cachedProfile.age);
    setDob(cachedProfile.dob);
    setLocation(cachedProfile.location);
    setPhone(cachedProfile.phone);
    setEmail(cachedProfile.email);
    setBloodType(cachedProfile.bloodType);
    setConditions(cachedProfile.conditions);
    setHeightWeight(cachedProfile.heightWeight);
    setIsEditing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header
        title={isEditing ? 'Edit Profile' : 'Profile'}
        subtitle="Personal Health Info"
        showBack
        rightComponent={
          isEditing ? (
            <TouchableOpacity onPress={saveProfile} style={styles.headerBtn} disabled={loading}>
              <Check size={20} color="#10B981" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerBtn} disabled={loading}>
              <Edit2 size={18} color={colors.accent} />
            </TouchableOpacity>
          )
        }
      />

      {loading && !isEditing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ marginTop: 12, color: colors.textMuted, fontSize: 13 }}>Synchronizing profile...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}>

          {/* Avatar Hero Card */}
          <LinearGradient
            colors={isDark ? ['#1a2340', '#0d1b32'] : ['#EBF5FF', '#DBEAFE']}
            style={[styles.avatarCard, { borderColor: colors.cardBorder }]}
          >
            <View style={styles.avatarWrapper}>
              <AvatarIllustration color="#3B82F6" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 }}>
              {fullName.trim() === '' ? 'Health User' : fullName}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              Age: {age.trim() === '' ? '—' : age} years old
            </Text>

            {/* Health stats row */}
            <View style={styles.statsRow}>
              {[
                { label: 'Total Scans', value: '7', color: '#3B82F6' },
                { label: 'Avg Risk', value: '20%', color: '#10B981' },
                { label: 'Risk Level', value: 'Low', color: '#10B981' },
              ].map((s, i) => (
                <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.cardBorder }]}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: s.color }}>{s.value}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Personal Details Block */}
          <LinearGradient
            colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
            style={[styles.card, { borderColor: colors.cardBorder }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Details</Text>
            
            <ProfileField
              icon={<User size={16} color="#3B82F6" />}
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              isEditing={isEditing}
            />
            <ProfileField
              icon={<Calendar size={16} color="#8B5CF6" />}
              label="Age"
              value={age}
              onChangeText={setAge}
              isEditing={isEditing}
              keyboardType="numeric"
              color="#8B5CF6"
            />
            <ProfileField
              icon={<Calendar size={16} color="#F59E0B" />}
              label="Date of Birth"
              value={dob}
              onChangeText={setDob}
              isEditing={isEditing}
              color="#F59E0B"
            />
            <ProfileField
              icon={<MapPin size={16} color="#10B981" />}
              label="Location"
              value={location}
              onChangeText={setLocation}
              isEditing={isEditing}
              color="#10B981"
            />
            <ProfileField
              icon={<Phone size={16} color="#8B5CF6" />}
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              isEditing={isEditing}
              keyboardType="phone-pad"
              color="#8B5CF6"
            />
            <ProfileField
              icon={<Mail size={16} color="#EC4899" />}
              label="Email"
              value={email}
              onChangeText={setEmail}
              isEditing={isEditing}
              keyboardType="email-address"
              color="#EC4899"
            />
          </LinearGradient>

          {/* Vitals & Health Attributes */}
          <LinearGradient
            colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFF', '#F8FAFC']}
            style={[styles.card, { borderColor: colors.cardBorder }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>Clinical Attributes</Text>
            
            <ProfileField
              icon={<Heart size={16} color="#FF6B8A" />}
              label="Blood Type"
              value={bloodType}
              onChangeText={setBloodType}
              isEditing={isEditing}
              color="#FF6B8A"
            />
            <ProfileField
              icon={<User size={16} color="#10B981" />}
              label="Height / Weight"
              value={heightWeight}
              onChangeText={setHeightWeight}
              isEditing={isEditing}
              color="#10B981"
            />
            <ProfileField
              icon={<Shield size={16} color="#3B82F6" />}
              label="Known Conditions"
              value={conditions}
              onChangeText={setConditions}
              isEditing={isEditing}
              color="#3B82F6"
            />
          </LinearGradient>

          {/* Edit Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={cancelEdit} style={[styles.btn, styles.cancelBtn, { borderColor: colors.cardBorder }]} disabled={loading}>
                <X size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveProfile} style={[styles.btn, styles.saveBtn, { backgroundColor: colors.accent }]} disabled={loading}>
                <Check size={15} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, color: '#FFF', fontWeight: '700' }}>Save Details</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy Shield Info */}
          <View style={[styles.privacyNote, { backgroundColor: `${colors.accent}08`, borderColor: `${colors.accent}20` }]}>
            <Shield size={14} color={colors.accent} />
            <Text style={{ fontSize: 12, color: colors.textMuted, flex: 1, lineHeight: 17, marginLeft: 8 }}>
              All profile attributes are synchronized securely with the Firebase Realtime Database.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCard: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(59,130,246,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statsRow: { flexDirection: 'row', marginTop: 20, width: '100%' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  fieldIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  input: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelBtn: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  saveBtn: {},
  privacyNote: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'flex-start' },
});
