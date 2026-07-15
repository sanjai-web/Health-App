// Standard clinical reference range classifiers for vital signs

export function getHeartRateStatus(hr: number) {
  if (hr < 60) return { status: 'warning' as const, statusLabel: 'Low', statusColor: '#F59E0B' };
  if (hr > 100) return { status: 'warning' as const, statusLabel: 'Elevated', statusColor: '#EF4444' };
  return { status: 'normal' as const, statusLabel: 'Optimal', statusColor: '#10B981' };
}

export function getTemperatureStatus(temp: number) {
  if (temp < 36.1) return { status: 'warning' as const, statusLabel: 'Low', statusColor: '#F59E0B' };
  if (temp > 37.2) return { status: 'warning' as const, statusLabel: 'Elevated', statusColor: '#EF4444' };
  return { status: 'normal' as const, statusLabel: 'Normal', statusColor: '#10B981' };
}

export function getSpO2Status(spo2: number) {
  if (spo2 < 95) return { status: 'warning' as const, statusLabel: 'Low', statusColor: '#EF4444' };
  return { status: 'normal' as const, statusLabel: 'Excellent', statusColor: '#10B981' };
}

export function getPIStatus(pi: number) {
  if (pi < 1.0) return { status: 'warning' as const, statusLabel: 'Low', statusColor: '#F59E0B' };
  if (pi > 10.0) return { status: 'warning' as const, statusLabel: 'Elevated', statusColor: '#EF4444' };
  return { status: 'normal' as const, statusLabel: 'Normal', statusColor: '#10B981' };
}
