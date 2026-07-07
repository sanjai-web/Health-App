import React from 'react';
import { View, Text } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Circle,
  Line,
} from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface DataPoint {
  value: number;
  label: string;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  gradientColors?: string[];
  showDots?: boolean;
  showArea?: boolean;
  showGrid?: boolean;
  gradientId?: string;
}

export default function LineChart({
  data,
  width = 300,
  height = 160,
  color = '#00D4FF',
  gradientColors,
  showDots = true,
  showArea = true,
  showGrid = true,
  gradientId = 'lineGrad',
}: LineChartProps) {
  const { colors } = useTheme();
  const gColors = gradientColors ?? [color, color];

  if (!data || data.length === 0) return null;

  const paddingH = 16;
  const paddingV = 16;
  const chartWidth = width - paddingH * 2;
  const chartHeight = height - paddingV * 2;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const getX = (i: number) => paddingH + (i / (data.length - 1)) * chartWidth;
  const getY = (v: number) => paddingV + chartHeight - ((v - minVal) / range) * chartHeight;

  // Build line path
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  // Build area path (closed)
  const areaPath = `${linePath} L ${getX(data.length - 1)} ${paddingV + chartHeight} L ${getX(0)} ${paddingV + chartHeight} Z`;

  const gridLines = 4;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id={`${gradientId}_line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={gColors[0]} />
            <Stop offset="100%" stopColor={gColors[1]} />
          </SvgGradient>
          <SvgGradient id={`${gradientId}_area`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={gColors[0]} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={gColors[0]} stopOpacity={0} />
          </SvgGradient>
        </Defs>

        {/* Grid lines */}
        {showGrid &&
          Array.from({ length: gridLines }).map((_, i) => {
            const y = paddingV + (i / (gridLines - 1)) * chartHeight;
            return (
              <Line
                key={i}
                x1={paddingH}
                y1={y}
                x2={width - paddingH}
                y2={y}
                stroke={colors.cardBorder}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            );
          })}

        {/* Area fill */}
        {showArea && (
          <Path d={areaPath} fill={`url(#${gradientId}_area)`} />
        )}

        {/* Line */}
        <Path
          d={linePath}
          stroke={`url(#${gradientId}_line)`}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots &&
          data.map((d, i) => (
            <Circle
              key={i}
              cx={getX(i)}
              cy={getY(d.value)}
              r={4}
              fill={gColors[0]}
              stroke={colors.surface}
              strokeWidth={2}
            />
          ))}
      </Svg>

      {/* X-axis labels */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: paddingH,
          marginTop: -4,
        }}
      >
        {data.map((d, i) => (
          <Text
            key={i}
            style={{ fontSize: 9, color: colors.textMuted, fontWeight: '500' }}
          >
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
