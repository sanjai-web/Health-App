import React from 'react';
import MetricDetailScreen from '../../components/vitals/MetricDetailScreen';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import { getHeartRateTrend } from '../../constants/mockData';

export default function HeartRateDetailScreen() {
  const { data } = useLatestHealthRecord();
  const trend = getHeartRateTrend();

  return (
    <MetricDetailScreen
      metricKey="heartRate"
      currentValue={data?.heartRate ?? 74}
      trend={trend}
      ringValue={((74 - 30) / (200 - 30)) * 100}
    />
  );
}
