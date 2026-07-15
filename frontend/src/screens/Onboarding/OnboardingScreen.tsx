import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ref, set, get } from 'firebase/database';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { getDefaultBackendUrl } from '../../config/api';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ONBOARDING_SCREENS } from '../../constants/mockData';
import { useTheme } from '../../hooks/useTheme';
import { 
  User, Heart, FileText, Upload, CheckCircle, ArrowRight, ArrowLeft, 
  Activity, Shield, Info, Activity as HeartPulse
} from 'lucide-react-native';
import Svg, { Circle, Path, Rect, Polyline } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

// Backend URL resolution helper is imported from config/api

function SlideIcon({ id, color }: { id: number; color: string }) {
  if (id === 1) return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={55} fill={`${color}12`} stroke={color} strokeWidth={1.5} strokeDasharray="6,4" />
      <Circle cx={60} cy={60} r={38} fill={`${color}08`} />
      <Path d="M20 60 L32 60 L42 38 L54 82 L66 46 L76 68 L86 60 L100 60"
        stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
  if (id === 2) return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={55} fill={`${color}12`} stroke={color} strokeWidth={1.5} strokeDasharray="6,4" />
      <Rect x={30} y={35} width={60} height={50} rx={10} fill={`${color}18`} stroke={color} strokeWidth={1.5} />
      <Circle cx={60} cy={50} r={8} fill={color} opacity={0.8} />
      <Path d="M45 70 L60 58 L75 70" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Circle cx={45} cy={76} r={4} fill={color} opacity={0.5} />
      <Circle cx={60} cy={76} r={4} fill={color} opacity={0.8} />
      <Circle cx={75} cy={76} r={4} fill={color} opacity={0.5} />
    </Svg>
  );
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={55} fill={`${color}12`} stroke={color} strokeWidth={1.5} strokeDasharray="6,4" />
      <Polyline points="24,80 38,55 52,65 66,40 80,52 94,38"
        stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={24} y={80} width={14} height={20} rx={3} fill={color} opacity={0.4} />
      <Rect x={45} y={65} width={14} height={35} rx={3} fill={color} opacity={0.6} />
      <Rect x={66} y={40} width={14} height={60} rx={3} fill={color} opacity={0.8} />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [enrollmentStep, setEnrollmentStep] = useState(0); // 0 = Slideshow, 1 = Auth, 2 = Basic Info, 3 = Medical Info, 4 = PDF Upload, 5 = Success
  const flatRef = useRef<FlatList>(null);

  // Authentication state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');
  const [bloodType, setBloodType] = useState('O-Positive');
  const [heightWeight, setHeightWeight] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [pastHealthIssues, setPastHealthIssues] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // PDF report state
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extractedLength, setExtractedLength] = useState(0);
  const [backendUrl, setBackendUrl] = useState(getDefaultBackendUrl());

  useEffect(() => {
    const url = getDefaultBackendUrl();
    setBackendUrl(url);
  }, []);

  const goNextSlide = () => {
    if (activeIndex < ONBOARDING_SCREENS.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      setEnrollmentStep(1); // Proceed to Authentication
    }
  };

  const skipSlides = () => {
    setEnrollmentStep(1); // Jump to Authentication
  };

  const handleAuth = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Fields Required', 'Please enter both email and password.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // Check if profile exists
        const profileRef = ref(db, `users/${uid}/profile`);
        const snapshot = await get(profileRef);
        
        if (snapshot.exists()) {
          // Profile exists, skip wizard and enter app
          navigation.replace('Main');
        } else {
          // No profile, proceed to step 2 (Basic details form)
          setEnrollmentStep(2);
        }
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Successfully registered, proceed to step 2 (Basic details form)
        setEnrollmentStep(2);
      }
    } catch (err: any) {
      const code: string = err?.code ?? '';

      // User does not have an account — prompt them to register
      if (
        authMode === 'login' &&
        (code === 'auth/user-not-found' ||
          code === 'auth/invalid-credential' ||
          code === 'auth/invalid-email' ||
          code === 'auth/wrong-password')
      ) {
        Alert.alert(
          'Account Not Found',
          'No account exists for this email. Would you like to create one?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Register',
              onPress: () => setAuthMode('signup'),
            },
          ]
        );
        return;
      }

      // Email already in use while trying to register
      if (authMode === 'signup' && code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account Already Exists',
          'An account with this email already exists. Would you like to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => setAuthMode('login'),
            },
          ]
        );
        return;
      }

      // Weak password
      if (code === 'auth/weak-password') {
        Alert.alert('Weak Password', 'Password must be at least 6 characters.');
        return;
      }

      // Fallback for any other errors
      Alert.alert('Authentication Error', err.message || 'Authentication failed. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setAuthLoading(false);
    }
  };


  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedFile(res.assets[0]);
        setUploadSuccess(false);
        setExtractedLength(0);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: 'base64'
      });

      const uid = auth.currentUser?.uid;

      const serverUrl = `${backendUrl}/api/upload-report`;
      console.log(`[Enrollment] Uploading PDF to: ${serverUrl}`);

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base64Pdf: base64Data,
          fileName: selectedFile.name,
          uid: uid || 'global'
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setUploadSuccess(true);
        setExtractedLength(result.length);
        Alert.alert('Success', `Successfully processed and saved your medical report! Extracted ${result.length} characters.`);
      } else {
        Alert.alert('Upload Failed', result.error || 'Server failed to process the PDF.');
      }
    } catch (err: any) {
      Alert.alert(
        'Upload Error',
        `Could not connect to the backend server at ${backendUrl}. Please ensure the backend is running.`
      );
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const saveEnrollment = async () => {
    if (fullName.trim() === '' || age.trim() === '') {
      Alert.alert('Required Fields', 'Please fill in your Name and Age to complete your health profile.');
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      
      const profileRef = ref(db, uid ? `users/${uid}/profile` : 'user_profile');
      await set(profileRef, {
        fullName,
        age,
        dob: '',
        location: '',
        phone: '',
        email,
        bloodType,
        conditions: conditions || 'None reported',
        heightWeight: heightWeight || 'Not set',
        sex,
        smokingStatus: 'Non-smoker',
        activityLevel: 'Active',
        medications: medications || 'None',
        emergencyContact: emergencyContact || 'Not set',
        pastHealthIssues: pastHealthIssues || 'None',
      });
      setEnrollmentStep(5); // Go to success screen
    } catch (err) {
      Alert.alert('Error', 'Failed to save enrollment details. Please try again.');
      console.error(err);
    }
  };

  const handleFinish = () => {
    navigation.replace('Main');
  };

  // Render slideshow step
  if (enrollmentStep === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <FlatList
          ref={flatRef}
          data={ONBOARDING_SCREENS}
          horizontal
          pagingEnabled
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(idx);
          }}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <LinearGradient
              colors={item.gradientColors as any}
              style={styles.slide}
            >
              <View style={[styles.glow, { backgroundColor: item.accentColor }]} />

              <View style={[styles.iconWrapper, { borderColor: `${item.accentColor}30`, backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <SlideIcon id={item.id} color={item.accentColor} />
              </View>

              <Text style={[styles.stepLabel, { color: item.accentColor }]}>
                {item.id} / {ONBOARDING_SCREENS.length}
              </Text>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </LinearGradient>
          )}
        />

        <View style={styles.controls}>
          <View style={styles.dots}>
            {ONBOARDING_SCREENS.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isActive ? item.accentColor : '#CBD5E1',
                      width: isActive ? 24 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity onPress={skipSlides} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={goNextSlide} style={styles.nextBtn}>
              <LinearGradient
                colors={[ONBOARDING_SCREENS[activeIndex].accentColor, ONBOARDING_SCREENS[activeIndex].accentColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextGradient}
              >
                <Text style={styles.nextText}>
                  {activeIndex === ONBOARDING_SCREENS.length - 1 ? 'Start Enrollment' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Render Enrollment steps (1 = Auth, 2 = Basic Details, 3 = Medical Info, 4 = PDF Upload, 5 = Success)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Enrollment</Text>
        {enrollmentStep < 5 && (
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            Step {enrollmentStep} of 4
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      {enrollmentStep < 5 && (
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: colors.accent,
                width: `${(enrollmentStep / 4) * 100}%`
              }
            ]} 
          />
        </View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {enrollmentStep === 1 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Secure Access</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
              Create a new clinical account or sign in to synchronize your vital diagnostics.
            </Text>

            {/* Auth Mode Selector */}
            <View style={styles.selectorRow}>
              {['login', 'signup'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setAuthMode(mode as any)}
                  style={[
                    styles.selectorChip,
                    authMode === mode ? { backgroundColor: colors.accent } : { backgroundColor: colors.card, borderColor: colors.cardBorder }
                  ]}
                >
                  <Text style={[styles.selectorChipText, authMode === mode ? { color: '#FFF' } : { color: colors.text }]}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="alex.river@healthmail.com"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <TouchableOpacity
              onPress={handleAuth}
              disabled={authLoading}
              style={[styles.finishBtn, { backgroundColor: colors.accent, marginTop: 12 }]}
            >
              {authLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>
                  {authMode === 'login' ? 'Sign In & Connect' : 'Register Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {enrollmentStep === 2 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <User size={20} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Details</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
              Enter your basic details. This information helps the AI adjust diagnostic thresholds correctly.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Alex River"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Age *</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="28"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Sex</Text>
              <View style={styles.selectorRow}>
                {['Male', 'Female', 'Other'].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setSex(opt)}
                    style={[
                      styles.selectorChip,
                      sex === opt ? { backgroundColor: colors.accent } : { backgroundColor: colors.card, borderColor: colors.cardBorder }
                    ]}
                  >
                    <Text style={[styles.selectorChipText, sex === opt ? { color: '#FFF' } : { color: colors.text }]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Height / Weight</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={heightWeight}
                onChangeText={setHeightWeight}
                placeholder="178 cm / 72 kg"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Blood Type</Text>
              <View style={styles.gridSelector}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(opt => {
                  const optLabel = opt.replace('+', '-Positive').replace('-', '-Negative');
                  const isSelected = bloodType === optLabel;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setBloodType(optLabel)}
                      style={[
                        styles.gridChip,
                        isSelected ? { backgroundColor: colors.accent } : { backgroundColor: colors.card, borderColor: colors.cardBorder }
                      ]}
                    >
                      <Text style={[styles.gridChipText, isSelected ? { color: '#FFF' } : { color: colors.text }]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {enrollmentStep === 3 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#EF4444" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical Baseline</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
              Enter any clinical conditions, medications, or historical health items that the AI should correlate with.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Clinical Conditions</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={conditions}
                onChangeText={setConditions}
                placeholder="e.g. Mild Hypertension, None"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Active Medications</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={medications}
                onChangeText={setMedications}
                placeholder="e.g. Lisinopril 10mg daily, None"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Past Health Issues</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={pastHealthIssues}
                onChangeText={setPastHealthIssues}
                placeholder="e.g. Asthma in childhood, None"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Emergency Contact Name & Phone</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Jane River (+1 555-019-2835)"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        )}

        {enrollmentStep === 4 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#EC4899" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical Report PDF (Optional)</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
              Upload a recent PDF medical report. The system will automatically extract details (like blood values, diagnoses) so the AI understands your baseline health.
            </Text>

            <LinearGradient
              colors={isDark ? ['#1a2340', '#0d1b32'] : ['#EBF5FF', '#DBEAFE']}
              style={[styles.uploadCard, { borderColor: colors.cardBorder }]}
            >
              <View style={styles.uploadIconWrapper}>
                <Upload size={32} color={colors.accent} />
              </View>
              
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
                Select Medical Report (PDF)
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 16, lineHeight: 16 }}>
                Extract and sync report details with your profile.
              </Text>

              {selectedFile ? (
                <View style={[styles.filePreview, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <FileText size={18} color="#10B981" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                      {selectedFile.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>
                      {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)} style={{ padding: 4 }}>
                    <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 11 }}>Clear</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={pickDocument} style={[styles.pickBtn, { backgroundColor: colors.accent }]}>
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Choose PDF Document</Text>
                </TouchableOpacity>
              )}

              {selectedFile && !uploadSuccess && (
                <TouchableOpacity
                  onPress={uploadFile}
                  disabled={uploading}
                  style={[styles.uploadBtn, { backgroundColor: '#10B981' }]}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Extract & Sync Report</Text>
                  )}
                </TouchableOpacity>
              )}

              {uploadSuccess && (
                <View style={styles.successRow}>
                  <CheckCircle size={18} color="#10B981" />
                  <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>
                    Sync Complete! ({extractedLength} characters)
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {enrollmentStep === 5 && (
          <View style={[styles.formSection, { alignItems: 'center', paddingTop: 30, gap: 16 }]}>
            <View style={[styles.successIconWrapper, { backgroundColor: `${colors.accent}15` }]}>
              <CheckCircle size={56} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Enrollment Complete!</Text>
            <Text style={[styles.successDesc, { color: colors.textMuted }]}>
              Thank you, {fullName}! Your medical profile has been successfully configured and synced over Firebase. 
            </Text>
            <View style={[styles.infoBanner, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Shield size={16} color={colors.accent} />
              <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1, marginLeft: 8, lineHeight: 18 }}>
                All personal medical data is stored securely. The AI will immediately utilize this profile to analyze your sensor vital signs stream.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Enrollment Footer Controls */}
      <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: colors.card }]}>
        {enrollmentStep < 5 ? (
          <View style={styles.footerRow}>
            {enrollmentStep > 1 ? (
              <TouchableOpacity 
                onPress={() => setEnrollmentStep(enrollmentStep - 1)} 
                style={[styles.backBtn, { borderColor: colors.cardBorder }]}
              >
                <ArrowLeft size={16} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontWeight: '600', marginLeft: 6 }}>Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => setEnrollmentStep(0)} 
                style={[styles.backBtn, { borderColor: colors.cardBorder }]}
              >
                <ArrowLeft size={16} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontWeight: '600', marginLeft: 6 }}>Intro</Text>
              </TouchableOpacity>
            )}

            {enrollmentStep > 1 ? (
              <TouchableOpacity 
                onPress={enrollmentStep === 4 ? saveEnrollment : () => setEnrollmentStep(enrollmentStep + 1)} 
                style={[styles.footerNextBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', marginRight: 6 }}>
                  {enrollmentStep === 4 ? 'Finish & Sync' : 'Next'}
                </Text>
                <ArrowRight size={16} color="#FFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity 
            onPress={handleFinish} 
            style={[styles.finishBtn, { backgroundColor: '#10B981' }]}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Enter App Diagnostics</Text>
            <HeartPulse size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 20,
    paddingBottom: 160,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.15,
    top: height * 0.18,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  skipText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  nextBtn: { borderRadius: 16, overflow: 'hidden', flex: 1, marginLeft: 16 },
  nextGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  nextText: { fontSize: 15, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
  
  // Enrollment Styles
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 56, 
    paddingBottom: 14, 
    borderBottomWidth: 1 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  progressBarBg: { height: 3, width: '100%', backgroundColor: 'rgba(0,0,0,0.05)' },
  progressBarFill: { height: '100%' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  formSection: { gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionDesc: { fontSize: 12, lineHeight: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600' },
  textInput: { height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },
  selectorRow: { flexDirection: 'row', gap: 10 },
  selectorChip: { flex: 1, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  selectorChipText: { fontSize: 13, fontWeight: '600' },
  gridSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridChip: { width: '23%', height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  gridChipText: { fontSize: 12, fontWeight: '600' },
  
  // Upload Card
  uploadCard: { borderRadius: 20, borderWidth: 1, padding: 20, alignItems: 'center', gap: 10, marginTop: 10 },
  uploadIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(59,130,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickBtn: { height: 38, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  uploadBtn: { height: 38, borderRadius: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', width: '100%' },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%'
  },
  successRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  successIconWrapper: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  successTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: -0.4 },
  successDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  infoBanner: { flexDirection: 'row', borderRadius: 14, padding: 12, alignItems: 'flex-start', marginTop: 10 },
  
  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 34, borderTopWidth: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, height: 44, borderRadius: 12, paddingHorizontal: 16 },
  footerNextBtn: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center' },
  finishBtn: { flexDirection: 'row', height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%' },
});
