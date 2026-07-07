import React from 'react';
import MetricDetailScreen from '../../components/vitals/MetricDetailScreen';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import { getPerfusionTrend } from '../../constants/mockData';

export default function PerfusionDetailScreen() {
  const { data } = useLatestHealthRecord();
  const trend = getPerfusionTrend();

  return (
    <MetricDetailScreen
      metricKey="perfusionIndex"
      currentValue={data?.perfusionIndex ?? 5.4}
      trend={trend}
      ringValue={((5.4 - 0) / (20 - 0)) * 100}
    />
  );
}
