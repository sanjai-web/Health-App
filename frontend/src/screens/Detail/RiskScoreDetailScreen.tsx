import React from 'react';
import MetricDetailScreen from '../../components/vitals/MetricDetailScreen';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import { getRiskScoreTrend } from '../../constants/mockData';

export default function RiskScoreDetailScreen() {
  const { data } = useLatestHealthRecord();
  const trend = getRiskScoreTrend();

  return (
    <MetricDetailScreen
      metricKey="healthRiskScore"
      currentValue={data?.healthRiskScore ?? 20}
      trend={trend}
      ringValue={20}
    />
  );
}
