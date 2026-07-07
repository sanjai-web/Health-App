import React from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSublabel?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({
  data,
  size = 160,
  strokeWidth = 22,
  centerLabel,
  centerSublabel,
}: DonutChartProps) {
  const { colors } = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2 - 4;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let currentAngle = 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={colors.card}
          strokeWidth={strokeWidth}
          opacity={0.3}
        />

        {data.map((seg, i) => {
          const angle = (seg.value / total) * 340; // 340° to leave a gap
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle += angle + 5; // 5° gap between segments

          const d = arcPath(cx, cy, radius, startAngle, endAngle);
          return (
            <Path
              key={i}
              d={d}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              opacity={0.9}
            />
          );
        })}

        {/* Center text */}
        {centerLabel && (
          <SvgText
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill={colors.text}
            fontSize={20}
            fontWeight="700"
          >
            {centerLabel}
          </SvgText>
        )}
        {centerSublabel && (
          <SvgText
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fill={colors.textMuted}
            fontSize={10}
            fontWeight="500"
          >
            {centerSublabel}
          </SvgText>
        )}
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 8 }}>
        {data.map((seg, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: seg.color }} />
            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '500' }}>
              {seg.label} ({seg.value}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
