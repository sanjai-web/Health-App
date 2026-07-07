import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, {
  Path, Defs, LinearGradient as SvgGradient,
  Stop, Circle, Line, Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RadialGaugeProps {
  value: number;      // 0–100
  size?: number;
  label?: string;
  sublabel?: string;
  ranges?: { min: number; max: number; color: string; label: string }[];
  color?: string;
  gradientColors?: string[];
  strokeWidth?: number;
}

export default function RadialGauge({
  value,
  size = 220,
  label,
  sublabel,
  ranges,
  color = '#3B82F6',
  gradientColors,
  strokeWidth = 20,
}: RadialGaugeProps) {
  const { colors } = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth * 2 - 20) / 2;

  // Arc spans 220° (from -110° to +110°, centered at bottom)
  const startAngle = -110;
  const endAngle = 110;
  const totalAngle = endAngle - startAngle; // 220°

  const gColors = gradientColors ?? [color, color];
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value / 100, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  function polarToXY(angle: number, rr = r) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + rr * Math.cos(rad), y: cy + rr * Math.sin(rad) };
  }

  function arcD(sa: number, ea: number, rr = r): string {
    const s = polarToXY(sa, rr);
    const e = polarToXY(ea, rr);
    const large = ea - sa > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rr} ${rr} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const circumferenceAngle = totalAngle;
  const progressAngle = startAngle + (value / 100) * circumferenceAngle;

  const trackD = arcD(startAngle, endAngle);
  const fillD = arcD(startAngle, Math.min(progressAngle, endAngle - 0.01));

  // Risk color zones
  const defaultRanges = [
    { min: 0, max: 30, color: '#10B981', label: 'Low' },
    { min: 30, max: 60, color: '#F59E0B', label: 'Moderate' },
    { min: 60, max: 80, color: '#EF4444', label: 'High' },
    { min: 80, max: 100, color: '#7C3AED', label: 'Critical' },
  ];
  const displayRanges = ranges ?? defaultRanges;

  // Determine active color
  const activeRange = displayRanges.find(r => value >= r.min && value <= r.max);
  const activeColor = activeRange?.color ?? color;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size * 0.7}>
        <Defs>
          <SvgGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.card} stopOpacity={0.5} />
            <Stop offset="100%" stopColor={colors.card} stopOpacity={0.5} />
          </SvgGradient>
          <SvgGradient id="gaugeFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={gColors[0]} />
            <Stop offset="100%" stopColor={gColors[1] ?? activeColor} />
          </SvgGradient>
        </Defs>

        {/* Zone bands */}
        {displayRanges.map((zone, i) => {
          const zoneSA = startAngle + (zone.min / 100) * circumferenceAngle;
          const zoneEA = startAngle + (zone.max / 100) * circumferenceAngle;
          const zoneD = arcD(zoneSA, zoneEA, r);
          return (
            <Path
              key={i}
              d={zoneD}
              stroke={zone.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="butt"
              opacity={0.2}
            />
          );
        })}

        {/* Active fill */}
        <Path
          d={fillD}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          opacity={0.95}
        />

        {/* Needle dot */}
        {(() => {
          const needlePt = polarToXY(progressAngle);
          return (
            <Circle
              cx={needlePt.x}
              cy={needlePt.y}
              r={strokeWidth / 2 + 2}
              fill={activeColor}
              stroke={colors.surface}
              strokeWidth={3}
            />
          );
        })()}

        {/* Score text */}
        <SvgText
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill={activeColor}
          fontSize={40}
          fontWeight="700"
        >
          {value}
        </SvgText>
        {sublabel && (
          <SvgText
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            fill={colors.textMuted}
            fontSize={11}
            fontWeight="500"
          >
            {sublabel}
          </SvgText>
        )}

        {/* Min / Max labels */}
        <SvgText x={16} y={size * 0.68} fill={colors.textMuted} fontSize={10} fontWeight="500">0</SvgText>
        <SvgText x={size - 26} y={size * 0.68} fill={colors.textMuted} fontSize={10} fontWeight="500">100</SvgText>
      </Svg>

      {/* Active zone label */}
      {activeRange && (
        <View style={{
          backgroundColor: `${activeColor}22`,
          paddingHorizontal: 16,
          paddingVertical: 5,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: `${activeColor}44`,
          marginTop: -4,
        }}>
          <Text style={{ color: activeColor, fontWeight: '700', fontSize: 13 }}>
            {activeRange.label} Risk
          </Text>
        </View>
      )}
    </View>
  );
}
