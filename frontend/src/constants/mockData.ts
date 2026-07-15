// ============================================================
// HEALTH DATA DEFINITIONS & MOCK DATABASES
// ============================================================

export interface HealthRecord {
  id: string;
  timestamp: string;
  bodyTemperature: number;  // °C
  heartRate: number;        // BPM
  spo2: number;             // %
  perfusionIndex: number;   // %
  signalStrength: number;   // %
  healthRiskScore: number;  // 0–100 % (AI Prediction)
  riskLevel: 'Low' | 'Medium' | 'Moderate' | 'High';
}

export interface VitalRange {
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  unit: string;
  label: string;
  description: string;
  clinicalInfo: string;
  color: string;
  gradientColors: string[];
}

// ─── Current / Latest Reading ───────────────────────────────
export const CURRENT_HEALTH_RECORD: HealthRecord = {
  id: 'rec-001',
  timestamp: new Date().toISOString(),
  bodyTemperature: 36.8,
  heartRate: 74,
  spo2: 98,
  perfusionIndex: 5.4,
  signalStrength: 98,
  healthRiskScore: 20,
  riskLevel: 'Low',
};

// ─── 7-Day Historical Trend Data ────────────────────────────
export const HISTORY_RECORDS: HealthRecord[] = [
  {
    id: 'rec-002',
    timestamp: '2026-07-02T09:15:00Z',
    bodyTemperature: 36.6,
    heartRate: 72,
    spo2: 97,
    perfusionIndex: 5.1,
    signalStrength: 96,
    healthRiskScore: 18,
    riskLevel: 'Low',
  },
  {
    id: 'rec-003',
    timestamp: '2026-07-01T11:45:00Z',
    bodyTemperature: 37.0,
    heartRate: 78,
    spo2: 97,
    perfusionIndex: 4.8,
    signalStrength: 95,
    healthRiskScore: 22,
    riskLevel: 'Low',
  },
  {
    id: 'rec-004',
    timestamp: '2026-06-30T08:30:00Z',
    bodyTemperature: 36.5,
    heartRate: 70,
    spo2: 99,
    perfusionIndex: 5.6,
    signalStrength: 99,
    healthRiskScore: 15,
    riskLevel: 'Low',
  },
  {
    id: 'rec-005',
    timestamp: '2026-06-29T14:20:00Z',
    bodyTemperature: 37.2,
    heartRate: 82,
    spo2: 96,
    perfusionIndex: 4.2,
    signalStrength: 92,
    healthRiskScore: 30,
    riskLevel: 'Medium',
  },
  {
    id: 'rec-006',
    timestamp: '2026-06-28T10:00:00Z',
    bodyTemperature: 36.7,
    heartRate: 75,
    spo2: 98,
    perfusionIndex: 5.3,
    signalStrength: 97,
    healthRiskScore: 19,
    riskLevel: 'Low',
  },
  {
    id: 'rec-007',
    timestamp: '2026-06-27T16:45:00Z',
    bodyTemperature: 36.9,
    heartRate: 77,
    spo2: 97,
    perfusionIndex: 5.0,
    signalStrength: 94,
    healthRiskScore: 21,
    riskLevel: 'Low',
  },
];

// ─── All Records (latest first) ─────────────────────────────
export const ALL_RECORDS: HealthRecord[] = [
  CURRENT_HEALTH_RECORD,
  ...HISTORY_RECORDS,
];

// ─── Vital Ranges & Clinical Info ───────────────────────────
export const VITAL_RANGES: Record<string, VitalRange> = {
  heartRate: {
    min: 30,
    max: 200,
    normalMin: 60,
    normalMax: 100,
    unit: 'BPM',
    label: 'Heart Rate',
    description: 'Beats Per Minute',
    clinicalInfo:
      'A normal resting heart rate for adults ranges from 60 to 100 beats per minute. Athletes may have rates as low as 40 BPM. Elevated heart rate can indicate stress, fever, or cardiac conditions.',
    color: '#FF6B8A',
    gradientColors: ['#FF6B8A', '#C2185B'],
  },
  bodyTemperature: {
    min: 34,
    max: 42,
    normalMin: 36.1,
    normalMax: 37.2,
    unit: '°C',
    label: 'Body Temperature',
    description: 'Core Body Temp',
    clinicalInfo:
      'Normal body temperature is typically 37°C (98.6°F), with acceptable range between 36.1–37.2°C. Fever is defined as temperature above 38°C. Hypothermia is below 35°C.',
    color: '#FF9500',
    gradientColors: ['#FF9500', '#E65100'],
  },
  spo2: {
    min: 70,
    max: 100,
    normalMin: 95,
    normalMax: 100,
    unit: '%',
    label: 'SpO₂',
    description: 'Blood Oxygen Saturation',
    clinicalInfo:
      'SpO₂ measures the percentage of oxygenated hemoglobin. Normal values are 95–100%. Values below 90% require immediate medical attention. Pulse oximetry is a non-invasive, fast measurement.',
    color: '#00D4FF',
    gradientColors: ['#00D4FF', '#0288D1'],
  },
  perfusionIndex: {
    min: 0,
    max: 20,
    normalMin: 1,
    normalMax: 10,
    unit: '%',
    label: 'Perfusion Index',
    description: 'PI – Pulsatile Blood Flow',
    clinicalInfo:
      'Perfusion Index (PI) represents the ratio of pulsatile to non-pulsatile blood flow. Values range from 0.02% to 20%. Higher values indicate stronger peripheral circulation. PI can be affected by cold extremities, peripheral vascular disease, or anemia.',
    color: '#8B5CF6',
    gradientColors: ['#8B5CF6', '#5B21B6'],
  },
  signalStrength: {
    min: 0,
    max: 100,
    normalMin: 80,
    normalMax: 100,
    unit: '%',
    label: 'Signal Strength',
    description: 'Sensor Signal Quality',
    clinicalInfo:
      'Signal strength indicates the quality of the optical sensor reading. Values above 80% provide reliable clinical data. Low signal may be caused by motion artifacts, ambient light interference, or improper sensor placement.',
    color: '#10B981',
    gradientColors: ['#10B981', '#065F46'],
  },
  healthRiskScore: {
    min: 0,
    max: 100,
    normalMin: 0,
    normalMax: 30,
    unit: '%',
    label: 'Health Risk Score',
    description: 'AI-Computed Risk Index',
    clinicalInfo:
      'The Health Risk Score is an AI-computed index derived from all five vital parameters. Score 0–30 indicates Low Risk. 31–60 is Moderate Risk. 61–80 is High Risk. 81–100 is Critical. The algorithm weighs each parameter against clinical norms.',
    color: '#3B82F6',
    gradientColors: ['#3B82F6', '#1D4ED8'],
  },
};

// ─── Chart Data Helpers ──────────────────────────────────────
export const getHeartRateTrend = () =>
  ALL_RECORDS.slice().reverse().map(r => ({ value: r.heartRate, label: formatShortDate(r.timestamp) }));

export const getTemperatureTrend = () =>
  ALL_RECORDS.slice().reverse().map(r => ({ value: r.bodyTemperature, label: formatShortDate(r.timestamp) }));

export const getSpO2Trend = () =>
  ALL_RECORDS.slice().reverse().map(r => ({ value: r.spo2, label: formatShortDate(r.timestamp) }));

export const getRiskScoreTrend = () =>
  ALL_RECORDS.slice().reverse().map(r => ({ value: r.healthRiskScore, label: formatShortDate(r.timestamp) }));

export const getPerfusionTrend = () =>
  ALL_RECORDS.slice().reverse().map(r => ({ value: r.perfusionIndex, label: formatShortDate(r.timestamp) }));

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ─── Notifications (Mock) ───────────────────────────────────
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'success',
    title: 'Cloud Sync Successful',
    message: 'All health records synced in real-time with Firebase. AI risk evaluation complete.',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'info',
    title: 'Weekly Health Trend',
    message: 'Your average heart rate this week is 75 BPM. That\'s within optimal range!',
    timestamp: '2026-07-02T09:16:00Z',
    read: true,
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'SpO₂ Excellent',
    message: 'Your blood oxygen has been at or above 97% for 7 consecutive days.',
    timestamp: '2026-07-01T08:00:00Z',
    read: true,
  },
];

// ─── Onboarding Screens Content (Light Theme Optimized) ─────
export const ONBOARDING_SCREENS = [
  {
    id: 1,
    title: 'Your Personal\nHealth Guardian',
    subtitle: 'Monitor 5 vital health parameters in a single, seamless scan. Minimalist layout with clinical precision.',
    icon: 'heart-pulse',
    gradientColors: ['#FFF5F6', '#FFEBEF', '#FFE0E5'],
    accentColor: '#FF6B8A',
  },
  {
    id: 2,
    title: 'AI-Powered\nRisk Analysis',
    subtitle: 'Our intelligent cloud algorithm analyzes your vitals in real-time and computes a health risk score.',
    icon: 'brain',
    gradientColors: ['#F0F9FF', '#E0F2FE', '#D0Eeff'],
    accentColor: '#00A8D0',
  },
  {
    id: 3,
    title: 'Real-time Trends &\nAnalytics',
    subtitle: 'Beautiful responsive charts, historical profiles, and clean medical reports synced over Firebase.',
    icon: 'chart-line',
    gradientColors: ['#F0FDF4', '#DCFCE7', '#CFFADE'],
    accentColor: '#10B981',
  },
];
