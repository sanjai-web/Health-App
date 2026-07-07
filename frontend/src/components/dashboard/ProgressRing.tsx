import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  value: number;       // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientId?: string;
  gradientColors?: string[];
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  animated?: boolean;
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  color = '#00D4FF',
  gradientId = 'ringGrad',
  gradientColors,
  label,
  sublabel,
  showValue = true,
  animated = true,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(value / 100, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = value / 100;
    }
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const gColors = gradientColors ?? [color, color];

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gColors[0]} />
            <Stop offset="100%" stopColor={gColors[1] ?? gColors[0]} />
          </SvgGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.card}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.4}
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center Content */}
      {showValue && (
        <View style={{ alignItems: 'center' }}>
          {label && (
            <Text
              style={{
                fontSize: size > 100 ? 22 : 16,
                fontWeight: '700',
                color: gColors[0],
                letterSpacing: -0.5,
              }}
            >
              {label}
            </Text>
          )}
          {sublabel && (
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500' }}>
              {sublabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
