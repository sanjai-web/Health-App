import React from 'react';
import MetricDetailScreen from '../../components/vitals/MetricDetailScreen';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import { getSpO2Trend } from '../../constants/mockData';

export default function SpO2DetailScreen() {
  const { data } = useLatestHealthRecord();
  const trend = getSpO2Trend();

  return (
    <MetricDetailScreen
      metricKey="spo2"
      currentValue={data?.spo2 ?? 98}
      trend={trend}
      ringValue={98}
    />
  );
}
