import React from 'react';
import MetricDetailScreen from '../../components/vitals/MetricDetailScreen';
import { useLatestHealthRecord } from '../../hooks/useHealthData';
import { getTemperatureTrend } from '../../constants/mockData';

export default function TemperatureDetailScreen() {
  const { data } = useLatestHealthRecord();
  const trend = getTemperatureTrend();

  return (
    <MetricDetailScreen
      metricKey="bodyTemperature"
      currentValue={data?.bodyTemperature ?? 36.8}
      trend={trend}
      ringValue={((36.8 - 34) / (42 - 34)) * 100}
    />
  );
}
