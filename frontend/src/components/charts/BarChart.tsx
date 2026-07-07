import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface BarData {
  value: number;
  label: string;
}

interface BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  gradientColors?: string[];
  gradientId?: string;
  barRadius?: number;
}

export default function BarChart({
  data,
  width = 300,
  height = 160,
  gradientColors = ['#00D4FF', '#3B82F6'],
  gradientId = 'barGrad',
  barRadius = 6,
}: BarChartProps) {
  const { colors } = useTheme();

  if (!data || data.length === 0) return null;

  const paddingH = 8;
  const paddingV = 16;
  const labelHeight = 20;
  const chartHeight = height - paddingV - labelHeight;
  const chartWidth = width - paddingH * 2;

  const maxVal = Math.max(...data.map(d => d.value));
  const barWidth = (chartWidth / data.length) * 0.55;
  const gap = (chartWidth / data.length) * 0.45;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </SvgGradient>
        </Defs>

        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartHeight;
          const x = paddingH + i * (barWidth + gap) + gap / 2;
          const y = paddingV + chartHeight - barH;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill={`url(#${gradientId})`}
              rx={barRadius}
              ry={barRadius}
              opacity={0.9}
            />
          );
        })}
      </Svg>

      {/* X-axis labels */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: paddingH,
          marginTop: -labelHeight + 4,
        }}
      >
        {data.map((d, i) => {
          const itemW = chartWidth / data.length;
          return (
            <View key={i} style={{ width: itemW, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '500' }}>
                {d.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
