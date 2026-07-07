import { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService';
import { HealthRecord, Notification } from '../constants/mockData';

// ─── Latest Health Record Hook (Firebase Realtime Subscription) ───
export const useLatestHealthRecord = () => {
  const [data, setData] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = healthService.subscribeToLatest((record) => {
      setData(record);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { data, loading, error, refetch: () => {} };
};

// ─── All Health Records Hook ──────────────────────────────────
export const useAllHealthRecords = () => {
  const [data, setData] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await healthService.getAllRecords();
      setData(records);
    } catch (e) {
      setError('Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── Notifications Hook ───────────────────────────────────────
export const useNotifications = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const notifs = await healthService.getNotifications();
      setData(notifs);
    } catch (e) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── Device / Firebase Status Hook ───────────────────────────
export const useDeviceStatus = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await healthService.getDeviceStatus();
      setData(status);
    } catch (e) {
      setError('Failed to fetch Firebase database status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
