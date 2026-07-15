import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  LayoutAnimation
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../../config/firebase';
import { useTheme } from '../../hooks/useTheme';
import Header from '../../components/common/Header';
import { StatusBar } from 'expo-status-bar';
import { FileText, Upload, CheckCircle, AlertCircle, Trash2, Calendar, Settings, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getDefaultBackendUrl } from '../../config/api';

interface ExtractedReport {
  id: string;
  fileName: string;
  text: string;
  timestamp: string;
}

// Backend URL resolution helper is imported from config/api

export default function UploadReportScreen() {
  const { colors, isDark } = useTheme();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [reports, setReports] = useState<ExtractedReport[]>([]);
  
  // Collapsible server settings
  const [showSettings, setShowSettings] = useState(false);
  const [backendUrl, setBackendUrl] = useState(getDefaultBackendUrl());

  const fetchReports = async () => {
    setLoadingHistory(true);
    try {
      const uid = auth.currentUser?.uid;
      const reportsRef = ref(db, uid ? `users/${uid}/extracted_reports` : 'user_profile/extracted_reports');
      const snapshot = await get(reportsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedReports: ExtractedReport[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort by timestamp desc
        loadedReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setReports(loadedReports);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Resolve the server URL after the native bridge and constants are initialized
    const detectedUrl = getDefaultBackendUrl();
    setBackendUrl(detectedUrl);
  }, []);

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedFile(res.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 1. Read document as Base64 string
      const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: 'base64'
      });

      // 2. POST to Backend Endpoint
      const serverUrl = `${backendUrl}/api/upload-report`;
      console.log(`Uploading PDF to: ${serverUrl}`);

      const uid = auth.currentUser?.uid;

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
        Alert.alert(
          'Success',
          `Successfully processed and saved your medical report! Extracted ${result.length} characters of medical text.`
        );
        setSelectedFile(null);
        fetchReports(); // Refresh history
      } else {
        Alert.alert('Upload Failed', result.error || 'Server failed to process the PDF.');
      }
    } catch (err: any) {
      Alert.alert(
        'Upload Error',
        `Could not connect to the backend server at ${backendUrl}. Please ensure the backend is running and the address is correct.`
      );
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteReport = async (id: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this medical record? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const uid = auth.currentUser?.uid;
              const reportRef = ref(db, uid ? `users/${uid}/extracted_reports/${id}` : `user_profile/extracted_reports/${id}`);
              await set(reportRef, null);
              fetchReports(); // Refresh
            } catch (err) {
              Alert.alert('Error', 'Failed to delete report.');
            }
          }
        }
      ]
    );
  };

  const toggleSettings = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSettings(!showSettings);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header title="Upload Medical Records" subtitle="Extract PDF Reports" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 20 }}>
        
        {/* Upload Container */}
        <LinearGradient
          colors={isDark ? ['#1a2340', '#0d1b32'] : ['#EBF5FF', '#DBEAFE']}
          style={[styles.uploadCard, { borderColor: colors.cardBorder }]}
        >
          <View style={styles.uploadIconWrapper}>
            <Upload size={32} color={colors.accent} />
          </View>
          
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
            Select Medical Report (PDF)
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 }}>
            Upload lab reports, prescriptions, or diagnostics. The AI will extract clinical details and sync them with your diagnostic profile.
          </Text>

          {selectedFile ? (
            <View style={[styles.filePreview, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <FileText size={20} color="#10B981" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  {selectedFile.name}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.clearFileBtn}>
                <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 12 }}>Clear</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={pickDocument} style={[styles.pickBtn, { backgroundColor: colors.accent }]}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Choose PDF Document</Text>
            </TouchableOpacity>
          )}

          {selectedFile && (
            <TouchableOpacity
              onPress={uploadFile}
              disabled={uploading}
              style={[styles.uploadBtn, { backgroundColor: '#10B981' }]}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Extract & Save Text</Text>
              )}
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Server IP Config */}
        <View style={[styles.settingsCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={toggleSettings} style={styles.settingsHeader}>
            <Settings size={16} color={colors.textSecondary} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, flex: 1, marginLeft: 8 }}>
              Backend Connection Settings
            </Text>
            {showSettings ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
          </TouchableOpacity>

          {showSettings && (
            <View style={styles.settingsBody}>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8 }}>
                Configure the URL of your running backend. In development mode, this is automatically resolved from Metro. In production, this should point to your hosted API.
              </Text>
              <View style={{ width: '100%' }}>
                <Text style={styles.inputLabel}>Backend Server URL</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
                  value={backendUrl}
                  onChangeText={setBackendUrl}
                  placeholder="http://192.168.1.XX:3000 or https://api.yourservice.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          )}
        </View>

        {/* History List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Uploaded Records ({reports.length})</Text>

        {loadingHistory ? (
          <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={28} color={colors.textMuted} />
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
              No uploaded medical reports found. Upload a PDF above to begin.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {reports.map(item => {
              const formattedDate = new Date(item.timestamp).toLocaleDateString([], {
                year: 'numeric', month: 'short', day: 'numeric'
              });
              return (
                <View key={item.id} style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.reportCardHeader}>
                    <View style={styles.reportTitleWrapper}>
                      <FileText size={18} color={colors.accent} />
                      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '700', color: colors.text, flex: 1, marginLeft: 8 }}>
                        {item.fileName}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteReport(item.id)} style={styles.deleteBtn}>
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.dateText}>
                    <Calendar size={10} color={colors.textMuted} /> {formattedDate}
                  </Text>

                  <View style={[styles.textPreviewContainer, { backgroundColor: isDark ? '#1A2235' : '#F8FAFC' }]}>
                    <Text numberOfLines={3} style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>
                      {item.text.trim().replace(/\s+/g, ' ')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadCard: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center', gap: 14 },
  uploadIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59,130,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickBtn: { height: 44, borderRadius: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  uploadBtn: { height: 44, borderRadius: 12, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', width: '100%' },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    width: '100%'
  },
  clearFileBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  settingsCard: { borderRadius: 16, borderWidth: 1, padding: 12 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center' },
  settingsBody: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  ipInputRow: { flexDirection: 'row', gap: 10 },
  inputLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  input: { height: 36, borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 32, opacity: 0.8 },
  reportCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 8 },
  reportCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitleWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deleteBtn: { padding: 4 },
  dateText: { fontSize: 11, color: '#94A3B8', flexDirection: 'row', alignItems: 'center', gap: 4 },
  textPreviewContainer: { borderRadius: 10, padding: 10 },
});
