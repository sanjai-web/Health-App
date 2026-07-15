import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertTriangle,
  Phone,
  Check,
  X,
  MapPin,
  Heart,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import { db, auth } from '../../config/firebase';
import { ref, get } from 'firebase/database';

const { width, height } = Dimensions.get('window');

// Predefined mock nearby hospitals in SF area (can work globally via geo links)
const NEARBY_HOSPITALS = [
  {
    name: 'City Central Hospital & Emergency',
    distance: '0.8 km (2 mins away)',
    phone: '+15559112831',
    address: '100 Main St, San Francisco, CA 94105',
  },
  {
    name: "St. Mary's Medical Center Emergency",
    distance: '1.5 km (5 mins away)',
    phone: '+15559115020',
    address: '450 Stanyan St, San Francisco, CA 94117',
  },
  {
    name: 'UCSF Medical Center Emergency Room',
    distance: '2.2 km (8 mins away)',
    phone: '+15559113990',
    address: '505 Parnassus Ave, San Francisco, CA 94143',
  },
];

export function extractPhoneNumber(contactStr: string): string {
  if (!contactStr || contactStr.trim() === '') return '911';
  
  // Try to match standard numbers inside parentheses first (e.g. (+1 555-019-2835))
  const parenMatch = contactStr.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const cleaned = parenMatch[1].replace(/[^\d+]/g, '');
    if (cleaned.length > 3) return cleaned;
  }
  
  // Clean up non-dialable characters except +, keep digit characters
  const cleanedContact = contactStr.replace(/[^\d+]/g, '');
  if (cleanedContact.length >= 3) {
    return cleanedContact;
  }
  
  return '911'; // default emergency services number fallback
}

export default function EmergencyAlertModal() {
  const { colors, isDark } = useTheme();
  const { data: latestRecord } = useLatestHealthRecord();

  // Alert State Machine
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<'none' | 'ask_ok' | 'no_emergency' | 'yes_reassurance'>('none');
  const [hasTriggeredForEpisode, setHasTriggeredForEpisode] = useState(false);
  
  const [emergencyPhone, setEmergencyPhone] = useState('911');
  const [contactName, setContactName] = useState('Emergency Services');

  // Load profile's emergency contact details
  const fetchEmergencyContact = async () => {
    try {
      const uid = auth.currentUser?.uid;
      const profileRef = ref(db, uid ? `users/${uid}/profile` : 'user_profile');
      const snapshot = await get(profileRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        const rawContact = val.emergencyContact || '';
        setEmergencyPhone(extractPhoneNumber(rawContact));
        
        // Parse contact name for display
        const namePart = rawContact.split('(')[0]?.trim();
        if (namePart) {
          setContactName(namePart);
        } else {
          setContactName('Emergency Contact');
        }
      } else {
        setEmergencyPhone('911');
        setContactName('Emergency Services');
      }
    } catch (err) {
      console.error('Failed to fetch emergency contact details:', err);
      setEmergencyPhone('911');
      setContactName('Emergency Services');
    }
  };

  useEffect(() => {
    if (!latestRecord) return;
    const score = latestRecord.healthRiskScore;

    if (score > 80) {
      if (!hasTriggeredForEpisode) {
        setHasTriggeredForEpisode(true);
        setCurrentStep('ask_ok');
        setModalVisible(true);
        fetchEmergencyContact();
      }
    } else {
      // Reset trigger guard when health risk score goes down below 80%
      setHasTriggeredForEpisode(false);
    }
  }, [latestRecord?.healthRiskScore]);

  const handleYes = () => {
    setCurrentStep('yes_reassurance');
  };

  const handleNo = () => {
    setCurrentStep('no_emergency');
    
    // Automatically trigger emergency contact call
    setTimeout(() => {
      Linking.openURL(`tel:${emergencyPhone}`).catch((err) => {
        console.error('Dialer error:', err);
        Alert.alert(
          'Call Error',
          `Could not open default dialer to call ${contactName} at ${emergencyPhone}.`
        );
      });
    }, 400);
  };

  const handleClose = () => {
    setModalVisible(false);
    setCurrentStep('none');
  };

  const openGoogleMapRoute = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open Google Maps route:', err);
      Alert.alert('Maps Error', 'Could not open Google Maps navigation.');
    });
  };

  const callHospital = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`).catch((err) => {
      console.error('Dialer error calling hospital:', err);
      Alert.alert('Call Error', 'Could not initiate hospital phone call.');
    });
  };

  if (!modalVisible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Step 1: Are you OK? */}
        {currentStep === 'ask_ok' && (
          <LinearGradient
            colors={isDark ? ['#2D1B24', '#1A0F1E'] : ['#FFF5F5', '#FFF0F0']}
            style={[styles.container, { borderColor: '#EF4444' }]}
          >
            <View style={[styles.headerContainer, { backgroundColor: '#EF444420' }]}>
              <AlertTriangle size={36} color="#EF4444" style={styles.icon} />
              <Text style={[styles.title, { color: '#EF4444' }]}>Critical Health Alert!</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                AI Health Score has detected a critical risk index of{' '}
                <Text style={{ fontWeight: '800', color: '#EF4444' }}>
                  {latestRecord?.healthRiskScore}%
                </Text>
                .
              </Text>
            </View>

            <View style={styles.bodyContainer}>
              <Text style={[styles.questionText, { color: colors.text }]}>Are you OK now?</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleNo}
                style={[styles.btn, styles.btnNo]}
              >
                <X size={18} color="#FFF" />
                <Text style={styles.btnNoText}>No, help me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleYes}
                style={[styles.btn, styles.btnYes]}
              >
                <Check size={18} color="#FFF" />
                <Text style={styles.btnYesText}>Yes, I am OK</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* Step 2A: Reassurance popup if user clicked Yes */}
        {currentStep === 'yes_reassurance' && (
          <LinearGradient
            colors={isDark ? ['#1A2E26', '#0F1A15'] : ['#F0FDF4', '#DCFCE7']}
            style={[styles.container, { borderColor: '#10B981' }]}
          >
            <View style={[styles.headerContainer, { backgroundColor: '#10B98120' }]}>
              <Heart size={36} color="#10B981" fill="#10B98120" style={styles.icon} />
              <Text style={[styles.title, { color: '#10B981' }]}>Glad You're OK</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We will continue to actively monitor your vital stats in real-time.
              </Text>
            </View>

            <View style={styles.bodyContainer}>
              <Text style={[styles.reassuranceMessage, { color: colors.textSecondary }]}>
                Please try to sit down, rest, and avoid any heavy activity. Take deep breaths. If you feel dizzy or notice pain, seek medical attention immediately.
              </Text>
            </View>

            <View style={styles.singleActionRow}>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.btn, { backgroundColor: '#10B981', flex: 1 }]}
              >
                <Text style={styles.btnText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* Step 2B: Emergency Actions popup if user clicked No */}
        {currentStep === 'no_emergency' && (
          <LinearGradient
            colors={isDark ? ['#1F1625', '#110C1A'] : ['#FAF5FF', '#F3E8FF']}
            style={[styles.containerHospital, { borderColor: '#8B5CF6' }]}
          >
            <View style={[styles.headerContainer, { backgroundColor: '#8B5CF620', paddingBottom: 10 }]}>
              <Phone size={32} color="#8B5CF6" style={styles.icon} />
              <Text style={[styles.title, { color: '#8B5CF6' }]}>Emergency Response Active</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We are calling your emergency contact:
              </Text>
              <View style={[styles.contactBubble, { backgroundColor: isDark ? '#2D1F38' : '#ECE0F8' }]}>
                <Text style={[styles.contactName, { color: colors.text }]}>{contactName}</Text>
                <Text style={[styles.contactPhone, { color: '#8B5CF6' }]}>{emergencyPhone}</Text>
              </View>
            </View>

            <View style={styles.hospitalHeader}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={[styles.hospitalTitle, { color: colors.text }]}>
                Nearby Hospitals & Routing
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.hospitalList}
            >
              {NEARBY_HOSPITALS.map((hospital, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openGoogleMapRoute(hospital.address)}
                  style={[
                    styles.hospitalCard,
                    {
                      backgroundColor: isDark ? '#261C33' : '#FFF',
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.hospitalName, { color: colors.text }]}>
                      {hospital.name}
                    </Text>
                    <Text style={[styles.hospitalMeta, { color: '#8B5CF6' }]}>
                      {hospital.distance}
                    </Text>
                    <Text style={[styles.hospitalAddress, { color: colors.textMuted }]}>
                      {hospital.address}
                    </Text>
                  </View>

                  <View style={styles.hospitalRightCol}>
                    <TouchableOpacity
                      onPress={() => callHospital(hospital.phone)}
                      style={[styles.hospitalCallBtn, { backgroundColor: '#8B5CF61A' }]}
                    >
                      <Phone size={14} color="#8B5CF6" />
                    </TouchableOpacity>
                    <View style={styles.hospitalDirectionsTag}>
                      <ChevronRight size={16} color={colors.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.mapsNoteRow}>
              <ExternalLink size={11} color={colors.textMuted} />
              <Text style={[styles.mapsNote, { color: colors.textMuted }]}>
                Tap any hospital to open route in Google Maps
              </Text>
            </View>

            <View style={styles.singleActionRow}>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.btn, { backgroundColor: '#8B5CF6', flex: 1 }]}
              >
                <Text style={styles.btnText}>Close Emergency Portal</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
  },
  containerHospital: {
    width: '100%',
    maxWidth: 360,
    maxHeight: height * 0.85,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
  },
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  bodyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  reassuranceMessage: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  singleActionRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  btn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnYes: {
    backgroundColor: '#10B981',
    flex: 1,
  },
  btnYesText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnNo: {
    backgroundColor: '#EF4444',
    flex: 1,
  },
  btnNoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  contactBubble: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  hospitalTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  hospitalList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  hospitalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  hospitalMeta: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 10,
    lineHeight: 13,
  },
  hospitalRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hospitalCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalDirectionsTag: {
    paddingLeft: 4,
  },
  mapsNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    paddingBottom: 4,
  },
  mapsNote: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
