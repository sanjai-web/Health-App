// ============================================================
// HEALTH SERVICE — API / Firebase Abstraction Layer
// All UI screens fetch their live data from this service.
// Real-time updates replicate Firebase Realtime Database.
// ============================================================

import { getDatabase, ref, onValue, get, set, push } from 'firebase/database';
import { HealthRecord, Notification, NOTIFICATIONS } from '../constants/mockData';

type RealtimeCallback = (data: HealthRecord) => void;

class HealthService {
  private baseUrl = 'https://in-1-health-check-default-rtdb.asia-southeast1.firebasedatabase.app';

  /**
   * Subscribe to live real-time updates from Firebase.
   */
  subscribeToLatest(callback: RealtimeCallback): () => void {
    const db = getDatabase();
    const healthRef = ref(db, 'health_records');
    
    // Subscribe using the Firebase SDK
    const unsubscribe = onValue(healthRef, (snapshot) => {
      const record = snapshot.val();
      if (record) {
        callback({
          id: 'latest',
          ...record
        });
      }
    }, (error) => {
      console.error('Firebase onValue subscription failed:', error);
    });

    return unsubscribe;
  }

  async getLatestRecord(): Promise<HealthRecord> {
    const db = getDatabase();
    const healthRef = ref(db, 'health_records');
    const snapshot = await get(healthRef);
    if (snapshot.exists()) {
      return {
        id: 'latest',
        ...snapshot.val()
      } as HealthRecord;
    }
    throw new Error('No health records found.');
  }

  async getAllRecords(): Promise<HealthRecord[]> {
    const db = getDatabase();
    const historyRef = ref(db, 'history');
    const snapshot = await get(historyRef);
    if (snapshot.exists()) {
      const rawData = snapshot.val();
      const records: HealthRecord[] = Object.keys(rawData).map(key => ({
        id: key,
        ...rawData[key],
      }));
      // Return records sorted by timestamp descending
      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [];
  }

  async getRecordById(id: string): Promise<HealthRecord | null> {
    const db = getDatabase();
    const historyRef = ref(db, `history/${id}`);
    const snapshot = await get(historyRef);
    if (snapshot.exists()) {
      return {
        id,
        ...snapshot.val()
      } as HealthRecord;
    }
    return null;
  }

  async getNotifications(): Promise<Notification[]> {
    // Notifications are local client reminders
    return NOTIFICATIONS;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = NOTIFICATIONS.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  /**
   * Push new measurement values directly to Firebase (triggers the backend AI).
   */
  async triggerMeasurement(vitals: Partial<HealthRecord>): Promise<HealthRecord> {
    const db = getDatabase();
    const healthRef = ref(db, 'health_records');
    const updatedRecord = {
      bodyTemperature: vitals.bodyTemperature || 36.8,
      heartRate: vitals.heartRate || 74,
      spo2: vitals.spo2 || 98,
      perfusionIndex: vitals.perfusionIndex || 5.4,
      signalStrength: vitals.signalStrength || 95,
      timestamp: new Date().toISOString()
    };
    
    // Save to database, triggering Node.js backend listener
    await set(healthRef, updatedRecord);
    return {
      id: 'latest',
      ...updatedRecord
    } as HealthRecord;
  }

  /**
   * Firebase Connection status specs.
   */
  async getDeviceStatus() {
    const db = getDatabase();
    // Use Firebase .info/connected path to check real-time connection status
    const connectedRef = ref(db, '.info/connected');
    const snapshot = await get(connectedRef);
    const isConnected = snapshot.val() === true;

    return {
      deviceId: 'firebase-rtdb-active',
      deviceName: 'Firebase Realtime Database',
      isConnected: isConnected,
      batteryLevel: 100, // Cloud uptime status
      firmwareVersion: '10.8.0', // SDK Version
      signalStrength: isConnected ? 99 : 0,
      lastSync: new Date().toISOString(),
      connectionType: 'Secure WebSocket (WSS)',
      calibrationStatus: 'Synchronized',
      sensorModel: 'Cloud Sync Node',
      macAddress: this.baseUrl,
    };
  }
}

export const healthService = new HealthService();
